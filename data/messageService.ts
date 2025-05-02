import { Message, MessageUpdate } from "@/types/message";
import { v4 as uuid } from "uuid";
import { DBService } from "./DBService";
import { MessageStore } from "@/store/messageStore";
import { MESSAGE_LABEL } from "./createLocalDB";

class MessageService extends DBService<Message> {
  private _messageStore: MessageStore
  constructor(db: IDBDatabase, messageStore: MessageStore) {
    super(MESSAGE_LABEL, db);
    this._messageStore = messageStore;
  }
  async getAllMessages() {
    const messages = await super.getAll();
    this._messageStore.setMessages(messages);
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
    await super.create(newMessage);
    this._messageStore.addMessage(newMessage);
  }
  async deleteMessage(id: string) {
    await super.delete(id);
    this._messageStore.deleteMessage(id);
  }
  async deleteChatMessages(chatId: string) {
    const messages = await super.getAll();
    for (const message of messages) {
      if (message.chatId == chatId) {
        await super.delete(message.id);
        this._messageStore.deleteMessage(message.id);
      }
    }
  }
  async updateMessage(data: MessageUpdate) {
    const message = this._messageStore.getMessageById(data.id);
    if (!message) throw new Error("Message not found");
    const newMessage = { ...data, createdAt: message.createdAt };
    await super.update(newMessage);
    this._messageStore.updateMessage(newMessage);
  }
}

export default MessageService;
