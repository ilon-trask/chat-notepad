import { convex } from "@/components/ConvexClientProvider";
import { ChangeService } from "./changeService";
import { LocalDBService } from "./localDB/localDBService";
import { api } from "@/convex/_generated/api";
import { LocalChange, RemoteChange } from "@/types/change";
import { Data } from "@/types/data/data";
import { changeSchema } from "@/convex/schema";
import tryCatch from "@/helpers/tryCatch";
import { SyncEntity } from "./entities/interface";
import { toast } from "sonner";
import { enetitiesAdapter, entities } from "./entities/entities";
import { Labels } from "@/constants/labels";
import isOnline from "@/helpers/isOnline";
import { liveQuery } from "dexie";

async function adapterServerFromClient(
  change: LocalChange
): Promise<typeof changeSchema.type> {
  const adapter = enetitiesAdapter[change.table as Labels];
  const { createdAt, editedAt, synced, ...rest } = change;

  const serverChange = {
    ...rest,
    data: await adapter.toServer(rest.data),
    createdAt: createdAt.valueOf(),
    editedAt: editedAt.valueOf(),
  } satisfies typeof changeSchema.type;

  return serverChange;
}

async function adapterClientFromServer(
  change: RemoteChange
): Promise<LocalChange> {
  const adapter = enetitiesAdapter[change.table as Labels];
  const newChange = {
    ...change,
    data: (await adapter.toClient({
      ...change.data,
      type: change.table as Labels,
    })) as any,
    synced: false,
    createdAt: new Date(change.createdAt),
    editedAt: new Date(change.editedAt),
    type: change.type,
  } satisfies LocalChange;

  return newChange;
}

export class Resolver {
  index: bigint;
  constructor(
    private localDBService: LocalDBService<Data>,
    private changeDBService: LocalDBService<LocalChange>,
    private changeService: ChangeService,
    private UIStore: SyncEntity
  ) {
    this.index = BigInt(0);
    this.awaitedChanges = new Set();
  }

  async loadUI(doneUpdate: () => void) {
    console.log("loadUI");
    const data = await this.localDBService.getAll();
    this.UIStore.set(data);
    doneUpdate();
    if (isOnline()) return;
    const changes = await this.changeDBService.getAll();
    const newChanges = changes.filter((el) => !el.synced);
    newChanges.sort((a, b) => Number(BigInt(a.index) - BigInt(b.index)));
    newChanges.forEach((change) => {
      this.applyChangesToUI(change);
    });
  }

  applyChangesToUI(change: LocalChange) {
    console.log("apply changes to UI", change);
    switch (change.type) {
      case "create":
        this.UIStore.create(change.data);
        break;
      case "update":
        this.UIStore.update(change.data.id, change.data);
        break;
      case "delete":
        this.UIStore.delete(change.data.id);
        break;
    }
  }

  async applyChangesFromServer(change: LocalChange) {
    const checkChange = await this.changeService.getOne(change.id);
    if (checkChange && checkChange.synced) return;
    const db = entities[change.table as Labels];
    console.log("apply change", change);
    switch (change.type) {
      case "create":
        await db.create({ ...change.data });
        break;
      case "update":
        await db.update(change.data.id, { ...change.data });
        break;
      case "delete":
        await db.delete(change.data.id);
        break;
    }
    if (checkChange) {
      await this.changeDBService.update(change.id, { ...change, synced: true });
    } else {
      await this.changeDBService.create({ ...change, synced: true });
    }
  }
  awaitedChanges: Set<string>;
  async sendChangesHandler(change: typeof changeSchema.type) {
    console.log("send");
    this.awaitedChanges.add(change.id);
    const [error, res] = await tryCatch(
      convex.mutation(api.change.create, { args: change })
    );
    console.log("recieved", res);
    if (error) {
      this.changeDBService.delete(change.id);
      const data = await this.localDBService.getAll();
      this.UIStore.set(data);

      if (error.message == "no such entity") {
        toast.error("error: no such entity");
        return;
      }

      throw error;
    }
    this.applyChangesFromServer(await adapterClientFromServer(res.change));
    console.log("update index", res.change.index);
    this.awaitedChanges.delete(change.id);
    if (this.index < res.change.index) this.index = res.change.index;
  }

  subscribeSendChanges() {
    const unsub = this.subscribeLocal(async (id: string) => {
      const change = await this.changeService.getOne(id);
      if (!change) throw new Error("Change not found");
      const remoteChange = await adapterServerFromClient(change);
      this.sendChangesHandler.call(this, remoteChange);
    });
    return unsub;
  }

  private subscribeLocal(callback: (id: string, type: string) => void) {
    return this.changeService.subscribe(callback);
  }

  async upToDateChanges() {
    let changes = await this.changeService.getAll();
    console.log("changes before", changes);
    changes = changes.filter((el) => el.synced);
    console.log("changes", changes);
    changes.sort((a, b) => Number(BigInt(a.index) - BigInt(b.index)));
    this.index = changes.at(-1)?.index ?? BigInt(0);
    const res = await convex.query(api.change.getAfter, { index: this.index });
    res.sort((a, b) => Number(a.index - b.index));
    this.index = res.at(-1)?.index ?? this.index;
    console.log("up to date", this.index, "data:", res);
    await this.resolver(res);
  }

  async subscribeResolver(): Promise<() => void> {
    return await new Promise((resolver, rej) => {
      const unsub = convex
        .watchQuery(api.change.getAfter, { index: this.index })
        .onUpdate(async () => {
          let changes = await this.changeService.getAll();
          let res = await convex.query(api.change.getAfter, {
            index: this.index,
          });
          res = res.filter(
            (el) => !this.awaitedChanges.has(el.id) && this.index < el.index
          );
          console.log("index", this.index, "res", res);
          res.sort((a, b) => Number(a.index - b.index));
          this.index = res.at(-1)?.index ?? this.index;
          await this.resolver(res);
          resolver(unsub);
        });
    });
  }

  async subscribeOfflineResolver() {
    const changes = await this.changeService.getAll();
    const filteredChanges = changes.filter((el) => !el.synced);
    filteredChanges.sort((a, b) => Number(BigInt(a.index) - BigInt(b.index)));
    const changesToServer = await Promise.all(
      filteredChanges.map((el) => adapterServerFromClient(el))
    );
    for (const change of changesToServer) {
      await this.sendChangesHandler(change);
    }
  }

  async resolver(res: RemoteChange[]) {
    for (const change of res) {
      const clientChange = await adapterClientFromServer(change);
      await this.applyChangesFromServer(clientChange);
      //memory leaks
      this.applyChangesToUI(clientChange);
    }
  }
}
