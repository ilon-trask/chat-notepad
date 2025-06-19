import { MessageUpdate } from "@/types/message.types";
import { v4 as uuid } from "uuid";
import { LocalDBService } from "./localDBService";
import { MESSAGE_LABEL } from "@/constants/labels";
import { RemoteDBService } from "./remoteDBService";
import { convex } from "@/components/ConvexClientProvider";
import deleteService, { DeleteService } from "./deleteService";
import fileService from "./fileService";
import isOnline from "@/helpers/isOnline";
import FileService from "./fileService";

class MessageService {
  localDBService: LocalDBService<typeof MESSAGE_LABEL>;
  remoteDBService: RemoteDBService<typeof MESSAGE_LABEL>;
  fileService: FileService;
  deleteService: DeleteService;

  constructor(fileService: FileService, deleteService: DeleteService) {
    this.localDBService = new LocalDBService<typeof MESSAGE_LABEL>(
      MESSAGE_LABEL
    );
    this.remoteDBService = new RemoteDBService<typeof MESSAGE_LABEL>(
      convex,
      MESSAGE_LABEL
    );
    this.fileService = fileService;
    this.deleteService = deleteService;
  }

  async getAllMessages() {
    const messages = await this.localDBService.getAll();
    return messages.toSorted(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );
  }

  async createMessage(content: string, chatId: string) {
    if (!chatId) throw new Error("Chat ID is required");
    const newMessage = {
      id: uuid(),
      content,
      createdAt: new Date(),
      editedAt: new Date(),
      chatId,
    };

    await this.localDBService.create(newMessage);

    if (isOnline()) {
      await this.remoteDBService
        .create({
          id: newMessage.id,
          content: newMessage.content,
          chatId: newMessage.chatId,
        })
        .then(async (el) => {
          const updatedMessage = {
            ...el,
            createdAt: new Date(el.createdAt),
            editedAt: new Date(el.editedAt),
          };
          await this.localDBService.update(updatedMessage);
        });
    }
    return newMessage;
  }

  async deleteMessage(id: string) {
    const message = await this.localDBService.getOne(id);
    if (isOnline()) {
      if (!message || !message._id)
        throw new Error("Message not found in remoteDB");
      this.remoteDBService.delete(message._id);
    } else {
      if (message?._id) {
        await this.deleteService.create({
          id: uuid(),
          entity_id: message._id,
          entityId: id,
          type: MESSAGE_LABEL,
        });
      }
    }
    this.fileService.deleteMessageFiles(message.id);
    await this.localDBService.delete(id);
  }

  async deleteChatMessages(chatId: string) {
    const messages = await this.localDBService.getAll();
    for (const message of messages) {
      if (message.chatId == chatId) {
        await this.localDBService.delete(message.id);
      }
    }
  }

  async updateMessage(data: MessageUpdate) {
    const message = await this.localDBService.getOne(data.id);
    if (!message) throw new Error("Message not found");
    const newMessage = {
      ...message,
      content: data.content,
    };

    if (isOnline()) {
      if (!message._id) throw new Error("Message not found in remoteDB");
      await this.remoteDBService.update({
        _id: message._id,
        content: data.content,
      });
    }

    await this.localDBService.update(newMessage);
  }
}

export default MessageService;
