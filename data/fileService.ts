import { FILE_LABEL } from "@/constants/labels";
import { LocalDBService } from "./localDBService";
import { v4 as uuid } from "uuid";
import { FileType } from "@/types/file.types";
import { api } from "@/convex/_generated/api";
import { RemoteDBService } from "./remoteDBService";
import { convex } from "@/components/ConvexClientProvider";
import isOnline from "@/helpers/isOnline";
import { FILE } from "dns";
import DeleteService from "./deleteService";

class FileLocalService {
  private _localDBService: LocalDBService;

  constructor(localDBService: LocalDBService) {
    this._localDBService = localDBService;
  }

  async getAll() {
    return this._localDBService.getAll<typeof FILE_LABEL>(FILE_LABEL);
  }

  async getOne(id: string) {
    return this._localDBService.getOne<typeof FILE_LABEL>(FILE_LABEL, id);
  }

  async addFile(
    data: Omit<FileType, "storageId" | "createdAt" | "editedAt">
  ): Promise<void> {
    this._localDBService.create<typeof FILE_LABEL>(FILE_LABEL, data);
  }
  async updateFile(data: FileType): Promise<void> {
    this._localDBService.update<typeof FILE_LABEL>(FILE_LABEL, data);
  }
  async deleteFile(id: string): Promise<void> {
    this._localDBService.delete(FILE_LABEL, id);
  }
}

class FileRemoteService {
  private _remoteDBService: RemoteDBService;

  constructor(remoteDBService: RemoteDBService) {
    this._remoteDBService = remoteDBService;
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

  async createFile(
    data: Omit<FileType, "storageId" | "createdAt" | "editedAt"> & {
      createdAt: number;
      editedAt: number;
    }
  ) {
    const storageId = await this.uploadPreviewFile(data);
    if (!storageId) throw new Error("File not uploaded");
    const { file, isPreview, ...rest } = data;
    return await this._remoteDBService.create<typeof FILE_LABEL>(FILE_LABEL, {
      ...rest,
      storageId,
    });
  }

  async updateFile(data: typeof api.files.update._args) {
    const res = await this._remoteDBService.update<typeof FILE_LABEL>(
      FILE_LABEL,
      { ...data }
    );
  }

  async deleteFile(_id: string) {
    return await this._remoteDBService.delete(FILE_LABEL, _id);
  }
}

export class FileService {
  localDBService: FileLocalService;
  remoteDBServie: FileRemoteService;
  private _deleteService: DeleteService;

  constructor(
    localDBService: LocalDBService,
    remoteDBService: RemoteDBService,
    deleteService: DeleteService
  ) {
    this.localDBService = new FileLocalService(localDBService);
    this.remoteDBServie = new FileRemoteService(remoteDBService);
    this._deleteService = deleteService;
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
      const serverFile = await this.remoteDBServie.createFile({
        ...file,
        createdAt: file.createdAt.valueOf(),
        editedAt: file.editedAt.valueOf(),
      });
      if (!serverFile) throw new Error("File not uploaded");
      if (serverFile.isPreview) throw new Error("File not uploaded");
      if (!serverFile.storageId) throw new Error("File not uploaded");
      await this.localDBService.updateFile({
        ...serverFile,
        file: file.file,
      });
      return serverFile;
    }
    return await this.localDBService.updateFile(file);
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
      if (newFile.isPreview) throw new Error("File is preview");

      if (newFile._id) {
        await this.remoteDBServie.updateFile({
          name: newFile.name,
          editedAt: newFile.editedAt.valueOf(),
          //@ts-ignore
          storageId: newFile.storageId,
          _id: newFile._id as any,
        });
      } else {
        const fileFile = newFile.file;
        newFile = await this.remoteDBServie.createFile({
          ...newFile,
          createdAt: newFile.createdAt.valueOf(),
          editedAt: newFile.editedAt.valueOf(),
        });
        newFile.file = fileFile;
      }
    }
    await this.localDBService.updateFile(newFile);
  }
  async deleteFile(id: string, _id: string | undefined): Promise<void> {
    const file = await this.localDBService.getOne(id);
    if (!file) throw new Error("File not found");
    if (isOnline()) {
      if (_id) await this.remoteDBServie.deleteFile(_id);
    } else {
      if (!file.isPreview) {
        if (file._id) {
          await this._deleteService.createDelete({
            id: uuid(),
            entity_id: file._id,
            entityId: id,
            type: FILE_LABEL,
          });
        }
      }
    }
    this.localDBService.deleteFile(id);
  }
  async deleteMessageFiles(messageId: string) {
    const files = await this.localDBService.getAll();
    const fileIds = files
      .filter((file) => file.messageId === messageId)
      //@ts-ignore
      .map((el) => ({ id: el.id, _id: el._id }));

    for (const { id, _id } of fileIds) {
      if (isOnline()) await this.remoteDBServie.deleteFile(_id);
      await this.localDBService.deleteFile(id);
    }
  }
}
