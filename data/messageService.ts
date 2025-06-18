import { Message, MessageUpdate } from "@/types/message.types";
import { v4 as uuid } from "uuid";
import { LocalDBService } from "./localDBService";
import { MessageStore } from "@/store/messageStore";
import { api } from "@/convex/_generated/api";
import { MESSAGE_LABEL } from "@/constants/labels";
import { RemoteDBService } from "./remoteDBService";
import DeleteService from "./deleteService";
import { FileService } from "./fileService";

export class MessageLocalDBService {
  private _localDBService: LocalDBService;

  constructor(localDBService: LocalDBService) {
    this._localDBService = localDBService;
  }

  async getAllMessages() {
    const messages =
      await this._localDBService.getAll<typeof MESSAGE_LABEL>(MESSAGE_LABEL);
    return messages;
  }

  async getOneMessage(id: string) {
    const message = await this._localDBService.getOne<typeof MESSAGE_LABEL>(
      MESSAGE_LABEL,
      id
    );
    if (!message) throw new Error("Message not found");
    return message;
  }

  async createMessage(data: Message) {
    const res = await this._localDBService.create<typeof MESSAGE_LABEL>(
      MESSAGE_LABEL,
      data
    );

    return res;
  }

  async updateMessage(data: Message) {
    return await this._localDBService.update(MESSAGE_LABEL, data);
  }

  async deleteMessage(id: string) {
    return await this._localDBService.delete(MESSAGE_LABEL, id);
  }
}

export class MessageRemoteDBService {
  private _remoteDBService: RemoteDBService;

  constructor(remoteDBService: RemoteDBService) {
    this._remoteDBService = remoteDBService;
  }

  async getAllMessages() {
    return await this._remoteDBService.getAll<typeof MESSAGE_LABEL>(
      MESSAGE_LABEL
    );
  }

  async createMessage(data: typeof api.messages.create._args) {
    return await this._remoteDBService.create<typeof MESSAGE_LABEL>(
      MESSAGE_LABEL,
      data
    );
  }

  async updateMessage(data: typeof api.messages.update._args) {
    return await this._remoteDBService.update<typeof MESSAGE_LABEL>(
      MESSAGE_LABEL,
      data
    );
  }

  async deleteMessage(_id: string) {
    return await this._remoteDBService.delete(MESSAGE_LABEL, _id);
  }
}

class MessageService {
  private _messageStore: MessageStore;
  private _isOnline: () => boolean;
  private _deleteService: DeleteService;
  private _fileService: FileService;
  localDBService: MessageLocalDBService;
  remoteDBService: MessageRemoteDBService;

  constructor(
    messageStore: MessageStore,
    isOnline: () => boolean,
    localDBService: LocalDBService,
    remoteDBService: RemoteDBService,
    deleteService: DeleteService,
    fileService: FileService
  ) {
    this._messageStore = messageStore;
    this._isOnline = isOnline;
    this._deleteService = deleteService;
    this.localDBService = new MessageLocalDBService(localDBService);
    this.remoteDBService = new MessageRemoteDBService(remoteDBService);
    this._fileService = fileService;
  }

  async getAllMessages() {
    const messages = await this.localDBService.getAllMessages();
    this._messageStore.setMessages(messages);
    return messages;
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

    await this.localDBService.createMessage(newMessage);
    this._messageStore.addMessage(newMessage);

    if (this._isOnline()) {
      await this.remoteDBService
        .createMessage({
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
          await this.localDBService.updateMessage(updatedMessage);
          this._messageStore.updateMessage(updatedMessage);
        });
    }
    return newMessage;
  }

  async deleteMessage(id: string) {
    const message = await this.localDBService.getOneMessage(id);
    if (this._isOnline()) {
      if (!message || !message._id)
        throw new Error("Message not found in remoteDB");
      this.remoteDBService.deleteMessage(message._id);
    } else {
      if (message?._id) {
        await this._deleteService.createDelete({
          id: uuid(),
          entity_id: message._id,
          entityId: id,
          type: MESSAGE_LABEL,
        });
      }
    }
    this._fileService.deleteMessageFiles(message.id);
    await this.localDBService.deleteMessage(id);
    this._messageStore.deleteMessage(id);
  }

  async deleteChatMessages(chatId: string) {
    const messages = await this.localDBService.getAllMessages();
    for (const message of messages) {
      if (message.chatId == chatId) {
        await this.localDBService.deleteMessage(message.id);
        this._messageStore.deleteMessage(message.id);
      }
    }
  }

  async updateMessage(data: MessageUpdate) {
    const message = await this.localDBService.getOneMessage(data.id);
    if (!message) throw new Error("Message not found");
    const newMessage = {
      ...message,
      content: data.content,
    };

    if (this._isOnline()) {
      if (!message._id) throw new Error("Message not found in remoteDB");
      await this.remoteDBService.updateMessage({
        _id: message._id,
        content: data.content,
      });
    }

    await this.localDBService.updateMessage(newMessage);
    this._messageStore.updateMessage(newMessage);
  }
}

export default MessageService;
