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
  constructor(
    private localDBService: LocalDBService<Data>,
    private changeDBService: LocalDBService<LocalChange>,
    private changeService: ChangeService,
    private UIStore: SyncEntity
  ) {}

  loadOfflineUIChanges() {
    console.log("load UI");
    const obs = liveQuery(() => this.localDBService.getAll());
    const sub = obs.subscribe({
      next: async (data) => {
        this.UIStore.set(data);
        if (isOnline()) return;
        const changes = await this.changeDBService.getAll();
        const newChanges = changes.filter((el) => !el.synced);
        newChanges.sort((a, b) => Number(BigInt(a.index) - BigInt(b.index)));
        console.log("new changes", newChanges);
        newChanges.forEach((change) => {
          this.applyChangesToUI(change);
        });
      },
      error: (err) => {
        console.log("error", err);
      },
    });
    return sub.unsubscribe;
    // useLiveQuery(async () => {
    //   const data = await this.localDBService.getAll();
    //   this.UIStore.set(data);
    //   if (isOnline()) return;
    //   const changes = await this.changeDBService.getAll();
    //   const newChanges = changes.filter((el) => !el.synced);
    //   console.log("new changes", newChanges);
    //   newChanges.forEach((change) => {
    //     this.applyChangesToUI(change);
    //   });
    // });
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
        db.create({ ...change.data });
        break;
      case "update":
        db.update(change.data.id, { ...change.data });
        break;
      case "delete":
        db.delete(change.data.id);
        break;
    }

    if (checkChange) {
      await this.changeDBService.update(change.id, { ...change, synced: true });
    } else {
      await this.changeDBService.create({ ...change, synced: true });
    }
  }

  async sendChangesHandler(change: typeof changeSchema.type) {
    if (!isOnline()) return;
    const [error, res] = await tryCatch(
      convex.mutation(api.change.create, { args: change })
    );
    if (error) {
      if (error.message == "no such entity") {
        toast.error("error: no such entity");
        this.changeDBService.delete(change.id);
        return;
      }
      throw error;
    }
    this.resolver([res.change]);
  }

  subscribeSendChanges() {
    this.subscribeLocal(async (id: string) => {
      const change = await this.changeService.getOne(id);
      if (!change) throw new Error("Change not found");
      const remoteChange = await adapterServerFromClient(change);
      this.sendChangesHandler.call(this, remoteChange);
    });
  }

  private subscribeLocal(callback: (id: string, type: string) => void) {
    this.changeService.subscribe(async (id: string, type: string) => {
      callback(id, type);
    });
  }

  async subscribeResolver() {
    if (!isOnline()) return;
    const change = await this.changeService.getAll();
    change.sort((a, b) => Number(BigInt(a.index) - BigInt(b.index)));
    let index = change.at(-1)?.index ?? BigInt(0);
    convex.watchQuery(api.change.getAfter, { index }).onUpdate(async () => {
      const res = await convex.query(api.change.getAfter, { index });
      res.sort((a, b) => Number(a.index - b.index));
      index = res.at(-1)?.index ?? BigInt(0);
      this.resolver(res);
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
  resolver(res: RemoteChange[]) {
    res.forEach(async (change) => {
      const clientChange = await adapterClientFromServer(change);
      this.applyChangesFromServer(clientChange);
    });
  }
}
