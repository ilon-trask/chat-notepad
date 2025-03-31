import { Message, MessageUpdate } from "@/types/message";
import { v4 as uuid } from "uuid";
import { DBService } from "./DBService";
import { MessageStore } from "@/store/messageStore";

export const MESSAGE_LABEL = "message";

class MessageService extends DBService<Message> {
  constructor() {
    super(MESSAGE_LABEL);
  }
  async getAllMessages(db: IDBDatabase,messageStore: MessageStore) {
    const messages = await super.getAll(db);
    messageStore.setMessages(messages);
  }
  async createMessage(
    db: IDBDatabase,
    messageStore: MessageStore,
    content: string,
    chatId: string
  ) {
    if(!chatId) throw new Error("Chat ID is required");
    const newMessage = {
      id: uuid(),
      content,
      createdAt: new Date(),
      editedAt: new Date(),
      chatId,
    };
    await super.create(db, newMessage);
    messageStore.addMessage(newMessage);
  }
  async deleteMessage(db: IDBDatabase, messageStore: MessageStore, id: string) {
    await super.delete(db, id);
    messageStore.deleteMessage(id);
  }
  async deleteChatMessages(
    db: IDBDatabase,
    messageStore: MessageStore,
    chatId: string
  ) {
    const messages = await super.getAll(db);
    for (const message of messages) {
      if (message.chatId == chatId) {
        await super.delete(db, message.id);
        messageStore.deleteMessage(message.id);
      }
    }
  }
  async updateMessage(db: IDBDatabase, messageStore: MessageStore, data: MessageUpdate) {
    const message = messageStore.getMessageById(data.id);
    if(!message) throw new Error("Message not found");
    const newMessage = { ...data, createdAt: message.createdAt };
    await super.update(db, newMessage);
    messageStore.updateMessage(newMessage);
  }
}

export default new MessageService();
