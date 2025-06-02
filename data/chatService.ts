import { Chat, ChatUpdate } from "@/types/chat.types";
import { v4 as uuid } from "uuid";
import MessageService from "./messageService";
import { ChatStore } from "@/store/chatStore";
import { LocalDBService } from "./localDBService";
import { api } from "@/convex/_generated/api";
import { CHAT_LABEL } from "@/constants/labels";
import { RemoteDBService } from "./remoteDBService";
import DeleteService from "./deleteService";

export class ChatLocalDBService {
  private _localDBService: LocalDBService;

  constructor(localDBService: LocalDBService) {
    this._localDBService = localDBService;
  }

  async getAllChats() {
    const chats =
      await this._localDBService.getAll<typeof CHAT_LABEL>(CHAT_LABEL);
    return chats;
  }

  async createChat(data: Chat) {
    return await this._localDBService.create<typeof CHAT_LABEL>(
      CHAT_LABEL,
      data
    );
  }

  async updateChat(data: Chat) {
    return await this._localDBService.update<typeof CHAT_LABEL>(
      CHAT_LABEL,
      data
    );
  }

  async deleteChat(id: string) {
    return await this._localDBService.delete(CHAT_LABEL, id);
  }
}

export class ChatRemoteDBService {
  private _remoteDBService: RemoteDBService;

  constructor(remoteDBService: RemoteDBService) {
    this._remoteDBService = remoteDBService;
  }

  async getAllChats() {
    return await this._remoteDBService.getAll<typeof CHAT_LABEL>(CHAT_LABEL);
  }

  async createChat(data: typeof api.chats.create._args) {
    return await this._remoteDBService.create<typeof CHAT_LABEL>(
      CHAT_LABEL,
      data
    );
  }

  async updateChat(data: typeof api.chats.update._args) {
    return await this._remoteDBService.update<typeof CHAT_LABEL>(
      CHAT_LABEL,
      data
    );
  }

  async deleteChat(_id: string) {
    return await this._remoteDBService.delete(CHAT_LABEL, _id);
  }
}

class ChatService {
  private _messageService: MessageService;
  private _chatStore: ChatStore;
  private _isOnline: () => boolean;
  private _deleteService: DeleteService;
  localDBService: ChatLocalDBService;
  remoteDBService: ChatRemoteDBService;

  constructor(
    messageService: MessageService,
    chatStore: ChatStore,
    isOnline: () => boolean,
    localDBService: LocalDBService,
    remoteDBService: RemoteDBService,
    deleteService: DeleteService
  ) {
    this._messageService = messageService;
    this._chatStore = chatStore;
    this._isOnline = isOnline;
    this._deleteService = deleteService;
    this.localDBService = new ChatLocalDBService(localDBService);
    this.remoteDBService = new ChatRemoteDBService(remoteDBService);
  }

  async getAllChats() {
    const chats = await this.localDBService.getAllChats();
    this._chatStore.setChats(chats);
  }

  async createChat(name: string) {
    const newChat = {
      id: uuid(),
      name,
      createdAt: new Date(),
      editedAt: new Date(),
    };
    let chat = await this.localDBService.createChat(newChat);
    this._chatStore.addChat(chat);

    if (this._isOnline()) {
      await this.remoteDBService
        .createChat({ id: chat.id, name: chat.name })
        .then(async (el) => {
          const newChat = {
            ...el,
            createdAt: new Date(el.createdAt),
            editedAt: new Date(el.editedAt),
          };
          await this.localDBService.updateChat(newChat);
          this._chatStore.updateChat(newChat);
          chat = newChat;
        });
    }
    return chat;
  }

  async deleteChat(id: string) {
    const chat = (await this.localDBService.getAllChats()).find(
      (el) => el.id == id
    );
    if (this._isOnline()) {
      if (!chat || !chat._id) throw new Error("Chat not found in remoteDB");
      this.remoteDBService.deleteChat(chat._id);
    } else {
      if (chat?._id)
        await this._deleteService.createDelete({
          id: uuid(),
          entity_id: chat._id,
          entityId: id,
          type: CHAT_LABEL,
        });
    }
    await this._messageService.deleteChatMessages(id);
    await this.localDBService.deleteChat(id);
    this._chatStore.deleteChat(id);
  }

  async updateChat(data: ChatUpdate) {
    const chat = (await this.localDBService.getAllChats()).find(
      (el) => el.id == data.id
    );
    if (!chat) throw new Error("Chat not found");
    const newChat = { ...chat, name: data.name, editedAt: new Date() };
    if (this._isOnline()) {
      if (!newChat._id) throw new Error("Chat not found in remoteDB");
      await this.remoteDBService.updateChat({
        _id: newChat._id,
        name: newChat.name,
      });
    }
    const res = await this.localDBService.updateChat(newChat);
    this._chatStore.updateChat(res);
  }
}

export default ChatService;
