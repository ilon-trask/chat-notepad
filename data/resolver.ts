import { convex } from "@/components/ConvexClientProvider";
import { ChangeService } from "./changeService";
import { LocalDBService } from "./localDB/localDBService";
import { api } from "@/convex/_generated/api";
import { LocalChange, RemoteChange } from "@/types/change";
import { Data } from "@/types/data/data";

function adapterServerFromClient(
  change: LocalChange
): Omit<RemoteChange, "userId"> {
  const newChange = {
    ...change,
    data: { ...change.data },
    oldData: { ...change.oldData },
  };

  if (newChange.data.editedAt)
    newChange.data.editedAt = newChange.data.editedAt.valueOf();
  if (newChange.data.createdAt)
    newChange.data.createdAt = newChange.data.createdAt.valueOf();
  if (newChange.oldData?.editedAt)
    newChange.oldData.editedAt = newChange.oldData.editedAt.valueOf();
  if (newChange.oldData?.createdAt)
    newChange.oldData.createdAt = newChange.oldData.createdAt.valueOf();
  if (newChange.createdAt) newChange.createdAt = newChange.createdAt.valueOf();
  if (newChange.editedAt) newChange.editedAt = newChange.editedAt.valueOf();

  delete newChange.data.status;
  delete newChange.data.type;
  delete newChange.synced;

  return newChange;
}

function adapterClientFromServer(change: RemoteChange): LocalChange {
  const newChange = {
    ...change,
    data: change.data && { ...change.data },
    oldData: change.oldData && { ...change.oldData },
    synced: true,
  };

  if (newChange.data.editedAt)
    newChange.data.editedAt = new Date(newChange.data.editedAt);
  if (newChange.data.createdAt)
    newChange.data.createdAt = new Date(newChange.data.createdAt);
  if (newChange.oldData?.editedAt)
    newChange.oldData.editedAt = new Date(newChange.oldData.editedAt);
  if (newChange.oldData?.createdAt)
    newChange.oldData.createdAt = new Date(newChange.oldData.createdAt);
  if (newChange.createdAt) newChange.createdAt = new Date(newChange.createdAt);
  if (newChange.editedAt) newChange.editedAt = new Date(newChange.editedAt);

  return newChange;
}

export class Resolver {
  constructor(
    private dataDBService: LocalDBService<Data, Data, Data>,
    private changeDBService: LocalDBService<
      LocalChange,
      LocalChange,
      LocalChange
    >,
    private changeService: ChangeService
  ) {}

  subscribeResolver() {
    convex.watchQuery(api.change.getAll).onUpdate(async () => {
      const res = await convex.query(api.change.getAll, {});
      this.resolver(res);
    });
  }

  resolver(res: RemoteChange[]) {
    res.forEach(async (change) => {
      this.applyChanges(adapterClientFromServer(change));
    });
  }

  private subscribeLocal(callback: (id: string, type: string) => void) {
    this.changeService.subscribe(async (id: string, type: string) => {
      if (type == "create") callback(id, type);
    });
  }

  async sendChangesHandler(id: string) {
    const change = await this.changeService.getOne(id);
    if (!change) throw new Error("Change not found");
    const remoteChange = adapterServerFromClient(change);
    //TODO: file upload needs to be implemented
    const res = await convex.mutation(api.change.create, remoteChange);
    console.log("res", remoteChange, change);
    console.log("res", res);
    if (res.success) {
      this.applyChanges(adapterClientFromServer(res.change));
    } else {
    }
  }

  subscribeSendChanges() {
    this.subscribeLocal(this.sendChangesHandler.bind(this));
  }

  async applyChanges(change: LocalChange) {
    const checkChange = await this.changeService.getOne(change.id);
    console.log("change", change, checkChange);
    if (checkChange && checkChange.synced) return;

    switch (change.type) {
      case "create":
        this.dataDBService.create({
          ...change.data,
          editedAt: new Date(change.data.editedAt),
          createdAt: new Date(change.data.createdAt),
          type: change.table as any,
          status: "server",
        });
        break;
      case "update":
        this.dataDBService.update({
          ...change.data,
          editedAt: new Date(change.data.editedAt),
          createdAt: new Date(change.data.createdAt),
          type: change.table as any,
          status: "server",
        });
        break;
      case "delete":
        this.dataDBService.delete(change.data.id);
        break;
    }

    if (checkChange) {
      await this.changeDBService.update(change, false);
    } else {
      await this.changeDBService.create(change, false);
    }
  }
}
