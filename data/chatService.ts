import { Chat, ChatUpdate } from "@/types/chat.types";
import { v4 as uuid } from "uuid";
import MessageService from "./messageService";
import { ChatStore } from "@/store/chatStore";
import { localDBService } from "./localDBService";
import { CHAT_LABEL } from "./createLocalDB";
import isOnline from "@/helpers/isOnline";
import { ConvexReactClient } from "convex/react";
import { api } from "@/convex/_generated/api";

class ChatService extends localDBService<Chat> {
  private _messageService: MessageService;
  private _chatStore: ChatStore;
  private _convexDB: ConvexReactClient;

  constructor(db: IDBDatabase, messageService: MessageService, chatStore: ChatStore, convexDB: ConvexReactClient) {
    super(CHAT_LABEL, db);
    this._messageService = messageService;
    this._chatStore = chatStore;
    this._convexDB = convexDB;
  }

  async getAllChats() {
    const chats = await super.getAll();
    this._chatStore.setChats(chats);
    return chats;
  }

  async createOfflineChat(data: Chat) {
    await super.create(data);
    this._chatStore.addChat(data);
    return data;
  }

  async createChat(name: string) {
    const newChat = { id: uuid(), name, createdAt: new Date(), editedAt: new Date() };
    if (isOnline()) {
      this._convexDB.mutation(api.chats.create, { id: newChat.id, name: newChat.name }).then(async (el) => {
        const newChat = { ...el, createdAt: new Date(el.createdAt), editedAt: new Date(el.editedAt) };
        await super.update(newChat);
        this._chatStore.updateChat(newChat);
      });
    }
    return this.createOfflineChat(newChat);
  }

  async deleteChat(id: string) {
    if (isOnline()) {
      const chat = (await super.getAll()).find((el) => el.id == id);
      if (!chat || !chat._id) throw new Error("Chat not found in convex");
      await this._convexDB.mutation(api.chats.deleteEntry, {
        _id: chat._id
      });
    }
    await this._messageService.deleteChatMessages(id);
    await super.delete(id);
    this._chatStore.deleteChat(id);
  }

  async updateOfflineChat(data: Chat) {
    await super.update(data);
    this._chatStore.updateChat(data);
  }

  async updateChat(data: ChatUpdate) {
    const chat = (await super.getAll()).find((el) => el.id == data.id);
    if (!chat) throw new Error("Chat not found");
    const newChat = { ...chat, name: data.name };
    if (isOnline()) {
      if (!newChat._id) throw new Error("Chat not found in convex");
      await this._convexDB.mutation(api.chats.update, {
        _id: newChat._id, name: newChat.name
      });
    }
    await this.updateOfflineChat(newChat);
  }
}

export default ChatService;