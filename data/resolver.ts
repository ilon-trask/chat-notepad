import { convex } from "@/components/ConvexClientProvider";
import { ChangeService } from "./changeService";
import { LocalDBService } from "./localDB/localDBService";
import { api } from "@/convex/_generated/api";
import { LocalChange, RemoteChange } from "@/types/change";
import { Data } from "@/types/data/data";
import { changeSchema } from "@/convex/schema";

function adapterServerFromClient(
  change: LocalChange
): typeof changeSchema.type {
  const { createdAt, editedAt, synced, ...rest } = change;
  //@ts-ignore
  delete rest.data?.status;
  //@ts-ignore
  delete rest.data?.type;
  //@ts-ignore
  delete rest.oldData?.status;
  //@ts-ignore
  delete rest.oldData?.type;

  const serverChange = (
    rest.type == "create"
      ? {
          ...rest,
          data: {
            ...rest.data,
            editedAt: rest.data.editedAt.valueOf(),
            createdAt: rest.data.createdAt.valueOf(),
          },
          //@ts-ignore
          oldData: undefined,
          createdAt: createdAt.valueOf(),
          editedAt: editedAt.valueOf(),
        }
      : rest.type == "delete"
        ? {
            ...rest,
            data: { ...rest.data },
            oldData: {
              ...rest.oldData,
              editedAt: rest.oldData.editedAt.valueOf(),
              createdAt: rest.oldData.createdAt.valueOf(),
            },
            createdAt: createdAt.valueOf(),
            editedAt: editedAt.valueOf(),
          }
        : {
            ...rest,
            data: {
              ...rest.data,
              editedAt: rest.data.editedAt.valueOf(),
              createdAt: rest.data.createdAt.valueOf(),
            },
            oldData: {
              ...rest.oldData,
              editedAt: rest.oldData.editedAt.valueOf(),
              createdAt: rest.oldData.createdAt.valueOf(),
            },
            createdAt: createdAt.valueOf(),
            editedAt: editedAt.valueOf(),
          }
  ) satisfies typeof changeSchema.type;

  return serverChange;
}

function adapterClientFromServer(change: RemoteChange): LocalChange {
  const newChange = (
    change.type == "delete"
      ? {
          ...change,
          data: { ...change.data },
          oldData: {
            ...change.oldData,
            status: "server",
            type: change.table as any,
            createdAt: new Date(change.oldData.createdAt),
            editedAt: new Date(change.oldData.editedAt),
          },
          synced: true,
          createdAt: new Date(change.createdAt),
          editedAt: new Date(change.editedAt),
        }
      : change.type == "create"
        ? {
            ...change,
            data: {
              ...change.data,
              createdAt: new Date(change.data.createdAt),
              editedAt: new Date(change.data.editedAt),
              status: "server",
              type: change.table as any,
            },
            oldData: undefined,
            synced: true,
            createdAt: new Date(change.createdAt),
            editedAt: new Date(change.editedAt),
          }
        : {
            ...change,
            data: {
              ...change.data,
              createdAt: new Date(change.data.createdAt),
              editedAt: new Date(change.data.editedAt),
              status: "server",
              type: change.table as any,
            },
            oldData: {
              ...change.oldData,
              status: "server",
              type: change.table as any,
              createdAt: new Date(change.oldData.createdAt),
              editedAt: new Date(change.oldData.editedAt),
            },
            synced: true,
            createdAt: new Date(change.createdAt),
            editedAt: new Date(change.editedAt),
          }
  ) satisfies LocalChange;

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
    const res = await convex.mutation(api.change.create, {
      args: remoteChange,
    });
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
    if (checkChange && checkChange.synced) return;

    switch (change.type) {
      case "create":
        this.dataDBService.create({
          ...change.data,
        });
        break;
      case "update":
        this.dataDBService.update({
          ...change.data,
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
