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

function adapterServerFromClient(
  change: LocalChange
): typeof changeSchema.type {
  const { createdAt, editedAt, synced, ...rest } = change;

  const serverChange = {
    ...rest,
    data: { ...rest.data },
    createdAt: createdAt.valueOf(),
    editedAt: editedAt.valueOf(),
  } satisfies typeof changeSchema.type;

  return serverChange;
}

function adapterClientFromServer(change: RemoteChange): LocalChange {
  const newChange = {
    ...change,
    data: { ...change.data } as any,
    synced: false,
    createdAt: new Date(change.createdAt),
    editedAt: new Date(change.editedAt),
    type: change.type,
  } satisfies LocalChange;

  return newChange;
}

// export class Old {
//   constructor(
//     private localDBService: LocalDBService<Data>,
//     private changeDBService: LocalDBService<LocalChange>,
//     private changeService: ChangeService
//   ) { }

//   subscribeResolver() {
//     convex.watchQuery(api.change.getAll).onUpdate(async () => {
//       const res = await convex.query(api.change.getAll, {});
//       console.log("changes: ", res);
//       this.resolver(res);
//     });
//   }

//   resolver(res: RemoteChange[]) {
//     res.forEach(async (change) => {
//       console.log("loop change:", change);
//       this.applyChanges(adapterClientFromServer(change));
//     });
//   }

//   private subscribeLocal(callback: (id: string, type: string) => void) {
//     this.changeService.subscribe(async (id: string, type: string) => {
//       if (type == "create") callback(id, type);
//     });
//   }

//   async sendChangesHandler(id: string) {
//     const change = await this.changeService.getOne(id);
//     if (!change) throw new Error("Change not found");

//     const remoteChange = adapterServerFromClient(change);
//     const [error, res] = await tryCatch(
//       convex.mutation(api.change.create, { args: remoteChange })
//     );
//     if (error) {
//       if (error.message == "no such entity") {
//         //delete the entry and change
//         return;
//       } else if (error.message == "older change was applied") {
//         //delete the entry and change
//       }
//       throw error;
//     }
//   }

//   subscribeSendChanges() {
//     this.subscribeLocal(this.sendChangesHandler.bind(this));
//   }

//   async applyChanges(change: LocalChange) {
//     const checkChange = await this.changeService.getOne(change.id);
//     if (checkChange && checkChange.synced) return;

//     switch (change.type) {
//       case "create":
//         this.localDBService.create({ ...change.data });
//         break;
//       case "update":
//         this.localDBService.update(change.data.id, { ...change.data });
//         break;
//       case "delete":
//         console.log("delete try: ", change.data.id);
//         this.localDBService.delete(change.data.id);
//         break;
//     }

//     if (checkChange) {
//       await this.changeDBService.update(change.id, change);
//     } else {
//       await this.changeDBService.create(change);
//     }
//   }
// }

export class Resolver {
  constructor(
    private localDBService: LocalDBService<Data>,
    private changeDBService: LocalDBService<LocalChange>,
    private changeService: ChangeService,
    private UIStore: SyncEntity
  ) { }


  async loadUI() {
    const data = await this.localDBService.getAll();
    this.UIStore.set(data);
    const changes = await this.changeDBService.getAll();
    const newChanges = changes.filter((el) => !el.synced);
    newChanges.forEach((change) => {
      this.applyChangesToUI(change);
    });
  }

  applyChangesToUI(change: LocalChange) {
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
    console.log('apply change', change)
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

  async sendChangesHandler(id: string) {
    const change = await this.changeService.getOne(id);
    if (!change) throw new Error("Change not found");
    console.log('change', change)
    const adapter = enetitiesAdapter[change.table as Labels];
    const remoteChange = adapterServerFromClient(change);
    const toServerChange = await adapter.toServer(remoteChange.data);
    remoteChange.data = toServerChange;
    console.log('toServerChange', remoteChange);
    console.log('adapter', adapter.constructor.name)
    const [error, res] = await tryCatch(
      convex.mutation(api.change.create, { args: remoteChange })
    );
    if (error) {
      if (error.message == "no such entity") {
        toast.error("error: no such entity");
        this.changeDBService.delete(id);
        return;
      }
      throw error;
    }
    console.log('from server', res.change)
    const clientChange = adapterClientFromServer(res.change);
    clientChange.data = await adapter.toClient({
      ...clientChange.data, type: change.table, status: "pending"
    });
    await this.applyChangesFromServer(clientChange);
  }

  subscribeSendChanges() {
    this.subscribeLocal(this.sendChangesHandler.bind(this));
  }

  private subscribeLocal(callback: (id: string, type: string) => void) {
    this.changeService.subscribe(async (id: string, type: string) => {
      callback(id, type);
    });
  }
  async subscribeResolver() {
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
  resolver(res: RemoteChange[]) {
    res.forEach(async (change) => {
      const adapter = enetitiesAdapter[change.table as Labels];
      const clientChange = adapterClientFromServer(change);
      clientChange.data = await adapter.toClient({ ...clientChange.data, type: change.table });
      this.applyChangesFromServer(clientChange);
    });
  }
}
