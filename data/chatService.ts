import { Chat, ChatUpdate } from "@/types/chat";
import { v4 as uuid } from "uuid";
import messageService from "./messageService";
import { ChatStore } from "@/store/chatStore";
import { DBService } from "./DBService";
import { MessageStore } from "@/store/messageStore";
import { CHAT_LABEL } from "./db";

class ChatService extends DBService<Chat> {
  constructor() {
    super(CHAT_LABEL);
  }
  async getAllChats(chatStore: ChatStore) {
    const chats = await super.getAll();
    chatStore.setChats(chats);
  }
  async createChat(chatStore: ChatStore, name: string) {
    const newChat = { id: uuid(), name, createdAt: new Date() };
    await super.create(newChat);
    chatStore.addChat(newChat);
    return newChat;
  }
  async deleteChat(
    chatStore: ChatStore,
    messageStore: MessageStore,
    id: string
  ) {
    await messageService.deleteChatMessages(messageStore, id);
    await super.delete(id);
    chatStore.deleteChat(id);
  }
  async updateChat(chatStore: ChatStore, data: ChatUpdate) {
    const chat = chatStore.getChatById(data.id);
    if (!chat) throw new Error("Chat not found");
    const newChat = { ...data, createdAt: chat.createdAt };
    await super.update(newChat);
    chatStore.updateChat(newChat);
  }
}

export default new ChatService();
