import { CHAT_LABEL, RemoteDBServiceMethods } from "@/constants/labels";
import { RemoteDBService } from "../remoteDB/remoteDBService";
import { DataService } from "@/types/dataService.types";
import { convex } from "@/components/ConvexClientProvider";

export type IChatLocalDBService = DataService<
  RemoteDBServiceMethods[typeof CHAT_LABEL]
>;

export class ChatRemoteDBService implements IChatLocalDBService {
  remoteDBService: RemoteDBService<typeof CHAT_LABEL>;

  constructor() {
    this.remoteDBService = new RemoteDBService<typeof CHAT_LABEL>(
      convex,
      CHAT_LABEL
    );
  }

  async getAll() {
    return this.remoteDBService.getAll();
  }
  async getOne(id: string) {
    return this.remoteDBService.getOne(id);
  }
  async create(data: RemoteDBServiceMethods[typeof CHAT_LABEL]["create"]) {
    return this.remoteDBService.create({
      id: data.id,
      name: data.name,
      createdAt: data.createdAt.valueOf(),
      editedAt: data.editedAt.valueOf(),
    });
  }
  async update(data: RemoteDBServiceMethods[typeof CHAT_LABEL]["update"]) {
    return this.remoteDBService.update({
      id: data.id,
      name: data.name,
      editedAt: data.editedAt.valueOf(),
    });
  }
  async delete(chatId: string) {
    return this.remoteDBService.delete(chatId);
  }
}
