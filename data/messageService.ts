import { Message, MessageUpdate } from "@/types/message.types";
import { v4 as uuid } from "uuid";
import { LocalDBService } from "./localDBService";
import { MessageStore } from "@/store/messageStore";
import { api } from "@/convex/_generated/api";
import { MESSAGE_LABEL } from "@/constants/labels";
import { RemoteDBService } from "./remoteDBService";

class MessageService {
  private _messageStore: MessageStore
  private _remoteDBService: RemoteDBService;
  private _isOnline: () => boolean;
  private _localDBservice: LocalDBService;

  constructor(
    messageStore: MessageStore,
    isOnline: () => boolean,
    localDBService: LocalDBService,
    remoteDBService: RemoteDBService
  ) {
    this._messageStore = messageStore;
    this._isOnline = isOnline;
    this._localDBservice = localDBService;
    this._remoteDBService = remoteDBService;
  }

  async getAllMessages() {
    const messages = await this._localDBservice.getAll<Message>(MESSAGE_LABEL);
    this._messageStore.setMessages(messages);
    return messages;
  }

  async getAllOnlineMessages() {
    const chats = await this._remoteDBService.getAll<typeof MESSAGE_LABEL>(MESSAGE_LABEL);
    return chats;
  }

  async createOfflineMessage(data: Message) {
    await this._localDBservice.create<Message>(MESSAGE_LABEL, data);
    this._messageStore.addMessage(data);
  }

  async createOnlineMessage(data: typeof api.messages.create._args) {
    return await this._remoteDBService.create<typeof MESSAGE_LABEL>(MESSAGE_LABEL, data);
  }

  async createMessage(
    content: string,
    chatId: string
  ) {
    if (!chatId) throw new Error("Chat ID is required");
    const newMessage = {
      id: uuid(),
      content,
      createdAt: new Date(),
      editedAt: new Date(),
      chatId,
    };
    if (this._isOnline()) {
      await this.createOnlineMessage({
        id: newMessage.id,
        content: newMessage.content,
        chatId: newMessage.chatId
      })
        .then(async (el) => {
          const newMessage = { ...el, createdAt: new Date(el.createdAt), editedAt: new Date(el.editedAt) };
          await this._localDBservice.update(MESSAGE_LABEL, newMessage);
          this._messageStore.updateMessage(newMessage);
        })
    }

    await this.createOfflineMessage(newMessage)
  }

  async deleteMessage(id: string) {
    if (this._isOnline()) {
      const message = (await this._localDBservice.getAll<Message>(MESSAGE_LABEL)).find((el) => el.id == id);
      if (!message || !message._id) throw new Error("Message not found in remoteDB");
      await this._remoteDBService.delete(MESSAGE_LABEL, message._id);
    }
    await this._localDBservice.delete(MESSAGE_LABEL, id);
    this._messageStore.deleteMessage(id);
  }

  async deleteChatMessages(chatId: string) {
    const messages = await this._localDBservice.getAll<Message>(MESSAGE_LABEL);
    for (const message of messages) {
      if (message.chatId == chatId) {
        await this._localDBservice.delete(MESSAGE_LABEL, message.id);
        this._messageStore.deleteMessage(message.id);
      }
    }
  }

  async updateOfflineMessage(data: Message) {
    await this._localDBservice.update(MESSAGE_LABEL, data);
    this._messageStore.updateMessage(data);
  }

  async updateOnlineMessage(data: typeof api.messages.update._args) {
    return await this._remoteDBService.update<typeof MESSAGE_LABEL>(MESSAGE_LABEL, data);
  }

  async updateMessage(data: MessageUpdate) {
    const message = (await this._localDBservice.getAll<Message>(MESSAGE_LABEL)).find((el) => el.id == data.id);
    if (!message) throw new Error("Message not found");
    const newMessage = { ...message, content: data.content };
    if (this._isOnline()) {
      if (!message._id) throw new Error("Message not found in remoteDB");
      await this.updateOnlineMessage({
        _id: message._id,
        content: data.content
      })
    }

    await this.updateOfflineMessage(newMessage);
  }
}

export default MessageService;
