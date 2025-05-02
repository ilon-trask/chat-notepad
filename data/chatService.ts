import { Chat, ChatUpdate } from "@/types/chat";
import { v4 as uuid } from "uuid";
import MessageService from "./messageService";
import { ChatStore } from "@/store/chatStore";
import { DBService } from "./DBService";
import { CHAT_LABEL } from "./createLocalDB";

class ChatService extends DBService<Chat> {
  private _messageService: MessageService;
  private _chatStore: ChatStore;
  constructor(db: IDBDatabase, messageService: MessageService, chatStore: ChatStore) {
    super(CHAT_LABEL, db);
    this._messageService = messageService;
    this._chatStore = chatStore;
  }
  async getAllChats() {
    const chats = await super.getAll();
    this._chatStore.setChats(chats);
  }
  async createChat(name: string) {
    const newChat = { id: uuid(), name, createdAt: new Date() };
    await super.create(newChat);
    this._chatStore.addChat(newChat);
    return newChat;
  }
  async deleteChat(
    id: string
  ) {
    await this._messageService.deleteChatMessages(id);
    await super.delete(id);
    this._chatStore.deleteChat(id);
  }
  async updateChat(data: ChatUpdate) {
    const chat = this._chatStore.getChatById(data.id);
    if (!chat) throw new Error("Chat not found");
    const newChat = { ...data, createdAt: chat.createdAt };
    await super.update(newChat);
    this._chatStore.updateChat(newChat);
  }
}

export default ChatService;