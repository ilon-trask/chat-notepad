import { FILE_LABEL, RemoteDBServiceMethods } from "@/constants/labels";
import { RemoteDBService } from "../remoteDB/remoteDBService";
import { DataService } from "@/types/dataService.types";
import { convex } from "@/components/ConvexClientProvider";
import { api } from "@/convex/_generated/api";
import { LocalFileType } from "@/types/file.types";

export type IFileLocalDBService = DataService<
  RemoteDBServiceMethods[typeof FILE_LABEL]
>;

export class FileRemoteDBService implements IFileLocalDBService {
  remoteDBService: RemoteDBService<typeof FILE_LABEL>;

  constructor() {
    this.remoteDBService = new RemoteDBService<typeof FILE_LABEL>(
      convex,
      FILE_LABEL
    );
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

  async uploadFile(file: Blob) {
    const url = await convex.mutation(api.files.generateUploadUrl);
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    const { storageId } = await res.json();
    return storageId as string | null;
  }

  async addImageToFile(file: Omit<LocalFileType, "file">) {
    const image = await this.serveFile(file.storageId!);
    return { ...file, file: image };
  }

  async getAll() {
    const files = await this.remoteDBService.getAll();
    return await Promise.all(files.map((file) => this.addImageToFile(file)));
  }
  async getOne(id: string) {
    const file = await this.remoteDBService.getOne(id);
    return this.addImageToFile(file);
  }
  
  async create(data: RemoteDBServiceMethods[typeof FILE_LABEL]["create"]) {
    const storageId = await this.uploadFile(data.file);
    if (!storageId) throw new Error("File not uploaded");
    const file = await this.remoteDBService.create({
      ...data,
      storageId,
      createdAt: data.createdAt.valueOf(),
      editedAt: data.editedAt.valueOf(),
    });
    return this.addImageToFile(file);
  }
  async update(data: RemoteDBServiceMethods[typeof FILE_LABEL]["update"]) {
    if (!data.storageId) throw new Error("File not uploaded");
    const file = await this.remoteDBService.update({
      id: data.id,
      storageId: data.storageId,
      name: data.name,
      editedAt: data.editedAt.valueOf(),
    });
    return this.addImageToFile(file);
  }
  async delete(id: string) {
    return this.remoteDBService.delete(id);
  }
}
