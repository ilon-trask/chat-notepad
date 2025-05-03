import { Message, MessageUpdate } from "@/types/message.types";
import { v4 as uuid } from "uuid";
import { localDBService } from "./localDBService";
import { MessageStore } from "@/store/messageStore";
import { MESSAGE_LABEL } from "./createLocalDB";
import { ConvexReactClient } from "convex/react";
import isOnline from "@/helpers/isOnline";
import { api } from "@/convex/_generated/api";

class MessageService extends localDBService<Message> {
  private _messageStore: MessageStore
  private _convexDB: ConvexReactClient;

  constructor(db: IDBDatabase, messageStore: MessageStore, convexDB: ConvexReactClient) {
    super(MESSAGE_LABEL, db);
    this._messageStore = messageStore;
    this._convexDB = convexDB;
  }

  async getAllMessages() {
    const messages = await super.getAll();
    this._messageStore.setMessages(messages);
    return messages;
  }

  async createOfflineMessage(data: Message) {
    await super.create(data);
    this._messageStore.addMessage(data);
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
    if (isOnline()) {
      this._convexDB.mutation(api.messages.create,
        {
          id: newMessage.id,
          content: newMessage.content,
          chatId: newMessage.chatId
        })
        .then(async (el) => {
          const newMessage = { ...el, createdAt: new Date(el.createdAt), editedAt: new Date(el.editedAt) };
          await super.update(newMessage);
          this._messageStore.updateMessage(newMessage);
        })
    }

    await this.createOfflineMessage(newMessage)
  }

  async deleteMessage(id: string) {
    if (isOnline()) {
      const message = (await super.getAll()).find((el) => el.id == id);
      if (!message || !message._id) throw new Error("Message not found in convex");
      await this._convexDB.mutation(api.messages.deleteEntry, {
        _id: message._id
      });
    }
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

  async updateOfflineMessage(data: Message) {
    await super.update(data);
    this._messageStore.updateMessage(data);
  }

  async updateMessage(data: MessageUpdate) {
    const message = (await super.getAll()).find((el) => el.id == data.id);
    if (!message) throw new Error("Message not found");
    const newMessage = { ...message, content: data.content };
    if (isOnline()) {
      if (!message._id) throw new Error("Message not found in convex");
      await this._convexDB.mutation(api.messages.update, {
        _id: message._id,
        content: data.content
      });
    }

    await this.updateOfflineMessage(newMessage);
  }
}

export default MessageService;
