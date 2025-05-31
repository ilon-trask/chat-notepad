import { Chat, ChatUpdate } from "@/types/chat.types";
import { v4 as uuid } from "uuid";
import MessageService from "./messageService";
import { ChatStore } from "@/store/chatStore";
import { LocalDBService } from "./localDBService";
import { api } from "@/convex/_generated/api";
import { CHAT_LABEL } from "@/constants/labels";
import { RemoteDBService } from "./remoteDBService";


class ChatService {
  private _messageService: MessageService;
  private _chatStore: ChatStore;
  private _localDBService: LocalDBService;
  private _remoteDBService: RemoteDBService;
  private _isOnline: () => boolean;

  constructor(
    messageService: MessageService,
    chatStore: ChatStore,
    isOnline: () => boolean,
    localDBService: LocalDBService,
    _remoteDBService: RemoteDBService,
  ) {
    this._localDBService = localDBService;
    this._messageService = messageService;
    this._chatStore = chatStore;
    this._isOnline = isOnline;
    this._remoteDBService = _remoteDBService;
  }

  async getAllChats() {
    const chats = await this._localDBService.getAll<Chat>(CHAT_LABEL);
    this._chatStore.setChats(chats);
    return chats;
  }

  async getAllOnlineChats() {
    const chats = await this._remoteDBService.getAll<typeof CHAT_LABEL>(CHAT_LABEL);
    return chats;
  }

  async createOfflineChat(data: Chat) {
    await this._localDBService.create(CHAT_LABEL, data);
    this._chatStore.addChat(data);
    return data;
  }

  async createOnlineChat(data: typeof api.chats.create._args) {
    return await this._remoteDBService.create<typeof CHAT_LABEL>(CHAT_LABEL, data);
  }

  async createChat(name: string) {
    const newChat = { id: uuid(), name, createdAt: new Date(), editedAt: new Date() };
    const res = await this.createOfflineChat(newChat);
    if (this._isOnline()) {
      this.createOnlineChat({ id: newChat.id, name: newChat.name }).then(async (el) => {
        const newChat = { ...el, createdAt: new Date(el.createdAt), editedAt: new Date(el.editedAt) };
        await this._localDBService.update(CHAT_LABEL, newChat);
        this._chatStore.updateChat(newChat);
      });
    }
    return res;
  }

  async deleteChat(id: string) {
    if (this._isOnline()) {
      const chat = (await this._localDBService.getAll<Chat>(CHAT_LABEL)).find((el) => el.id == id);
      if (!chat || !chat._id) throw new Error("Chat not found in remoteDB");
      await this._remoteDBService.delete(CHAT_LABEL, chat._id);
    }
    await this._messageService.deleteChatMessages(id);
    await this._localDBService.delete(CHAT_LABEL, id);
    this._chatStore.deleteChat(id);
  }

  async updateOfflineChat(data: Chat) {
    await this._localDBService.update<Chat>(CHAT_LABEL, data);
    this._chatStore.updateChat(data);
  }

  async updateOnlineChat(data: typeof api.chats.update._args) {
    return await this._remoteDBService.update<typeof CHAT_LABEL>(CHAT_LABEL, data);
  }

  async updateChat(data: ChatUpdate) {
    const chat = (await this._localDBService.getAll<Chat>(CHAT_LABEL)).find((el) => el.id == data.id);
    if (!chat) throw new Error("Chat not found");
    const newChat = { ...chat, name: data.name };
    if (this._isOnline()) {
      if (!newChat._id) throw new Error("Chat not found in remoteDB");
      await this.updateOnlineChat({ _id: newChat._id, name: newChat.name });
    }
    await this.updateOfflineChat(newChat);
  }
}

export default ChatService;