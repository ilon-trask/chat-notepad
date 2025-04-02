import { Message, MessageUpdate } from "@/types/message";
import { v4 as uuid } from "uuid";
import { DBService } from "./DBService";
import { MessageStore } from "@/store/messageStore";
import { MESSAGE_LABEL } from "./db";

class MessageService extends DBService<Message> {
  constructor() {
    super(MESSAGE_LABEL);
  }
  async getAllMessages(messageStore: MessageStore) {
    const messages = await super.getAll();
    messageStore.setMessages(messages);
  }
  async createMessage(
    messageStore: MessageStore,
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
    await super.create(newMessage);
    messageStore.addMessage(newMessage);
  }
  async deleteMessage(messageStore: MessageStore, id: string) {
    await super.delete(id);
    messageStore.deleteMessage(id);
  }
  async deleteChatMessages(messageStore: MessageStore, chatId: string) {
    const messages = await super.getAll();
    for (const message of messages) {
      if (message.chatId == chatId) {
        await super.delete(message.id);
        messageStore.deleteMessage(message.id);
      }
    }
  }
  async updateMessage(messageStore: MessageStore, data: MessageUpdate) {
    const message = messageStore.getMessageById(data.id);
    if (!message) throw new Error("Message not found");
    const newMessage = { ...data, createdAt: message.createdAt };
    await super.update(newMessage);
    messageStore.updateMessage(newMessage);
  }
}

export default new MessageService();
