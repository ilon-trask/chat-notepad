import { MESSAGE_LABEL, RemoteDBServiceMethods } from "@/constants/labels";
import { DataService } from "@/types/dataService.types";
import { RemoteDBService } from "../remoteDB/remoteDBService";
import { convex } from "@/components/ConvexClientProvider";

export type IMessageRemoteDBService = DataService<
  RemoteDBServiceMethods[typeof MESSAGE_LABEL]
>;

export class MessageRemoteDBService implements IMessageRemoteDBService {
  remoteDBService: RemoteDBService<typeof MESSAGE_LABEL>;
  constructor() {
    this.remoteDBService = new RemoteDBService<typeof MESSAGE_LABEL>(
      convex,
      MESSAGE_LABEL
    );
  }
  async getAll() {
    return this.remoteDBService.getAll();
  }
  async getOne(id: string) {
    return this.remoteDBService.getOne(id);
  }
  async create(data: RemoteDBServiceMethods[typeof MESSAGE_LABEL]["create"]) {
    return this.remoteDBService.create({
      id: data.id,
      content: data.content,
      chatId: data.chatId,
      createdAt: data.createdAt.valueOf(),
      editedAt: data.editedAt.valueOf(),
    });
  }
  async update(data: RemoteDBServiceMethods[typeof MESSAGE_LABEL]["update"]) {
    return this.remoteDBService.update({
      id: data.id,
      content: data.content,
      editedAt: data.editedAt.valueOf(),
    });
  }
  async delete(messageId: string) {
    return this.remoteDBService.delete(messageId);
  }
}
