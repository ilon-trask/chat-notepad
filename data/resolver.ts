import { convex } from "@/components/ConvexClientProvider";
import { ChangeService } from "./changeService";
import { LocalDBService } from "./localDB/localDBService";
import { api } from "@/convex/_generated/api";
import { LocalChange, RemoteChange } from "@/types/change";
import { Data } from "@/types/data/data";
import { changeSchema } from "@/convex/schema";
import tryCatch from "@/helpers/tryCatch";
import { FILE_LABEL } from "@/constants/labels";

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
  //@ts-ignore
  delete rest.data?.file;
  //@ts-ignore
  delete rest.oldData?.file;

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
    private localDBService: LocalDBService<Data>,
    private changeDBService: LocalDBService<LocalChange>,
    private changeService: ChangeService
  ) {}

  subscribeResolver() {
    convex.watchQuery(api.change.getAll).onUpdate(async () => {
      const res = await convex.query(api.change.getAll, {});
      console.log("changes: ", res);
      this.resolver(res);
    });
  }

  resolver(res: RemoteChange[]) {
    res.forEach(async (change) => {
      console.log("loop change:", change);
      this.applyChanges(adapterClientFromServer(change));
    });
  }

  private subscribeLocal(callback: (id: string, type: string) => void) {
    this.changeService.subscribe(async (id: string, type: string) => {
      if (type == "create") callback(id, type);
    });
  }

  async uploadFileHandler(file: Blob) {
    const url = await convex.mutation(api.files.generateUploadUrl);
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    const {
      storageId,
    }: {
      storageId: string | null | undefined;
    } = await res.json();
    if (!storageId) throw new Error("file upload fail");
    return storageId;
  }

  async serveFile(storageId: string) {
    const getImageUrl = new URL(
      `${process.env.NEXT_PUBLIC_CONVEX_SITE_URL}/getImage`
    );
    getImageUrl.searchParams.set("storageId", storageId);
    console.log("getImageUrl", getImageUrl, getImageUrl.href);
    const res = await fetch(getImageUrl);
    const blob = await res.blob();
    return blob;
  }

  async sendChangesHandler(id: string) {
    const change = await this.changeService.getOne(id);
    if (!change) throw new Error("Change not found");
    if (change.type != "delete") {
      if (change.data.type == FILE_LABEL) {
        const storageId = await this.uploadFileHandler(change.data.file);
        change.data.storageId = storageId;
      }
    }

    const remoteChange = adapterServerFromClient(change);
    const [error, res] = await tryCatch(
      convex.mutation(api.change.create, { args: remoteChange })
    );
    if (error) {
      if (error.message == "no such entity") {
        //delete the entry and change
        return;
      } else if (error.message == "older change was applied") {
        //delete the entry and change
      }
      this.rollbackChangesHandler(change);
      throw error;
    }
  }

  async rollbackChangesHandler(change: LocalChange) {
    switch (change.type) {
      case "create":
        this.localDBService.delete(change.data.id);
        break;

      case "delete":
        if (change.oldData.type == FILE_LABEL) {
          const blob = await this.serveFile(change.oldData.storageId!);
          change.oldData.file = blob;
        }
        this.localDBService.create(change.oldData);
        break;

      case "update":
        if (change.oldData.type == FILE_LABEL) {
          const blob = await this.serveFile(change.oldData.storageId!);
          change.oldData.file = blob;
        }
        this.localDBService.update(change.oldData.id, change.oldData);
        break;

      default:
        const _exhaustive: never = change;
        return _exhaustive;
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
        if (change.data.type == FILE_LABEL) {
          const blob = await this.serveFile(change.data.storageId!);
          change.data.file = blob;
        }
        this.localDBService.create({ ...change.data });
        break;
      case "update":
        if (change.data.type == FILE_LABEL) {
          const blob = await this.serveFile(change.data.storageId!);
          change.data.file = blob;
        }
        this.localDBService.update(change.data.id, { ...change.data });
        break;
      case "delete":
        console.log("delete try: ", change.data.id);
        this.localDBService.delete(change.data.id);
        break;
    }

    if (checkChange) {
      await this.changeDBService.update(change.id, change, false);
    } else {
      await this.changeDBService.create(change, false);
    }
  }
}
