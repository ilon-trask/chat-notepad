import { FILE_LABEL } from "@/constants/labels";
import { LocalDBService } from "./localDBService";
import { v4 as uuid } from "uuid";
import { LocalFileType } from "@/types/file.types";
import { api } from "@/convex/_generated/api";
import { RemoteDBService } from "./remoteDBService";
import { convex } from "@/components/ConvexClientProvider";
import isOnline from "@/helpers/isOnline";
import DeleteService from "./deleteService";

class FileService {
  localDBService: LocalDBService<typeof FILE_LABEL>;
  remoteDBService: RemoteDBService<typeof FILE_LABEL>;
  deleteService: DeleteService;

  constructor(deleteService: DeleteService) {
    this.localDBService = new LocalDBService<typeof FILE_LABEL>(FILE_LABEL);
    this.remoteDBService = new RemoteDBService<typeof FILE_LABEL>(
      convex,
      FILE_LABEL
    );
    this.deleteService = deleteService;
  }

  async uploadFile(file: File) {
    const url = await convex.mutation(api.files.generateUploadUrl);
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    const { storageId } = await res.json();
    return storageId as string | null;
  }

  async getMessageFiles(messageId: string) {
    const files = await this.localDBService.getAll();
    const res = files.filter((file) => file.messageId === messageId);
    return res;
  }

  async getOneFile(id: string) {
    const file = await this.localDBService.getOne(id);
    if (!file) throw new Error("File not found");
    return file;
  }

  async createFile(file: LocalFileType) {
    if (isOnline()) {
      const { file: _, ...rest } = file;
      const storageId = await this.uploadFile(file.file);
      if (!storageId) throw new Error("File not uploaded");
      const serverFile = await this.remoteDBService
        .create({
          ...rest,
          createdAt: file.createdAt.valueOf(),
          editedAt: file.editedAt.valueOf(),
          storageId,
        })
        .then(async (el) => {
          return await this.localDBService.update({
            ...el,
            file: file.file,
            status: "server",
            createdAt: new Date(file.createdAt),
            editedAt: new Date(file.editedAt),
          });
        });

      return serverFile;
    }
    return await this.localDBService.update(file);
  }

  async deleteFile(id: string): Promise<void> {
    const file = await this.localDBService.getOne(id);
    if (!file) throw new Error("File not found");
    if (isOnline()) {
      await this.remoteDBService.delete(id);
    } else {
      await this.deleteService.create({
        id: uuid(),
        entityId: id,
        type: FILE_LABEL,
      });
    }
    this.localDBService.delete(id);
  }

  async deleteMessageFiles(messageId: string) {
    const files = await this.localDBService.getAll();
    const fileIds = files
      .filter((file) => file.messageId === messageId)
      //@ts-ignore
      .map((el) => el.id);

    for (const id of fileIds) {
      if (isOnline()) await this.remoteDBService.delete(id);
      await this.localDBService.delete(id);
    }
  }
}

export default FileService;
