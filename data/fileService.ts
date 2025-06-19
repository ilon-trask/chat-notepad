import { FILE_LABEL } from "@/constants/labels";
import { LocalDBService } from "./localDBService";
import { v4 as uuid } from "uuid";
import { FileType } from "@/types/file.types";
import { api } from "@/convex/_generated/api";
import { RemoteDBService } from "./remoteDBService";
import { convex } from "@/components/ConvexClientProvider";
import isOnline from "@/helpers/isOnline";
import DeleteService from "./deleteService";

class FileService {
  localDBService: LocalDBService<typeof FILE_LABEL>;
  remoteDBServie: RemoteDBService<typeof FILE_LABEL>;
  deleteService: DeleteService;

  constructor(deleteService: DeleteService) {
    this.localDBService = new LocalDBService<typeof FILE_LABEL>(FILE_LABEL);
    this.remoteDBServie = new RemoteDBService<typeof FILE_LABEL>(
      convex,
      FILE_LABEL
    );
    this.deleteService = deleteService;
  }

  async uploadPreviewFile(
    file: Omit<FileType, "storageId" | "createdAt" | "editedAt">
  ) {
    const url = await convex.mutation(api.files.generateUploadUrl);
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": file!.file.type },
      body: file.file,
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

  async createFile(file: FileType) {
    if (isOnline()) {
      const storageId = await this.uploadPreviewFile(file);
      if (!storageId) throw new Error("File not uploaded");
      const serverFile = await this.remoteDBServie.create({
        ...file,
        createdAt: file.createdAt.valueOf(),
        editedAt: file.editedAt.valueOf(),
        storageId,
      });
      if (!serverFile) throw new Error("File not uploaded");
      if (!serverFile.storageId) throw new Error("File not uploaded");
      await this.localDBService.update({
        ...serverFile,
        file: file.file,
      });
      return serverFile;
    }
    return await this.localDBService.update(file);
  }

  async updateFile(data: FileType): Promise<void> {
    const file = await this.localDBService.getOne(data.id);
    if (!file) throw new Error("File not found");
    let newFile = {
      ...file,
      isPreview: false,
      name: data.name,
      editedAt: new Date(),
    } as FileType;
    if (isOnline()) {
      if (newFile._id) {
        await this.remoteDBServie.update({
          name: newFile.name,
          editedAt: newFile.editedAt.valueOf(),
          //@ts-ignore
          storageId: newFile.storageId,
          _id: newFile._id as any,
        });
      } else {
        const fileFile = newFile.file;
        const storageId = await this.uploadPreviewFile(file);
        if (!storageId) throw new Error("File not uploaded");
        newFile = await this.remoteDBServie.create({
          ...newFile,
          createdAt: newFile.createdAt.valueOf(),
          editedAt: newFile.editedAt.valueOf(),
          storageId,
        });
        newFile.file = fileFile;
      }
    }
    await this.localDBService.update(newFile);
  }
  async deleteFile(id: string, _id: string | undefined): Promise<void> {
    const file = await this.localDBService.getOne(id);
    if (!file) throw new Error("File not found");
    if (isOnline()) {
      if (_id) await this.remoteDBServie.delete(_id);
    } else {
      if (file._id) {
        await this.deleteService.create({
          id: uuid(),
          entity_id: file._id,
          entityId: id,
          type: FILE_LABEL,
        });
      }
    }
    this.localDBService.delete(id);
  }
  async deleteMessageFiles(messageId: string) {
    const files = await this.localDBService.getAll();
    const fileIds = files
      .filter((file) => file.messageId === messageId)
      //@ts-ignore
      .map((el) => ({ id: el.id, _id: el._id }));

    for (const { id, _id } of fileIds) {
      if (isOnline()) await this.remoteDBServie.delete(_id);
      await this.localDBService.delete(id);
    }
  }
}

export default FileService;
