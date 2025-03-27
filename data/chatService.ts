import { Chat } from "@/types/chat";
import { v4 as uuid } from "uuid";

type ChatAdd = (value: Chat, key?: IDBValidKey) => IDBRequest<IDBValidKey>;
type ChatPut = (value: Chat, key?: IDBValidKey) => IDBRequest<IDBValidKey>;

export const CHAT_LABEL = "chat";

class ChatService {
  private _getReadDbChatObject(db: IDBDatabase) {
    const transaction = db.transaction(CHAT_LABEL, "readonly");
    const chatDB = transaction.objectStore(CHAT_LABEL);
    return chatDB;
  }
  private _getWriteDbChatObject(db: IDBDatabase) {
    const transaction = db.transaction(CHAT_LABEL, "readwrite");
    const chatDB = transaction.objectStore(CHAT_LABEL);
    type ChatDB = Omit<typeof chatDB, "add" | "put"> & {
      add: ChatAdd;
      put: ChatPut;
    };
    return chatDB as ChatDB;
  }
  async getChats(db: IDBDatabase) {
    const chat = this._getReadDbChatObject(db);
    const chats: Chat[] | DOMException = await new Promise((resolve, reject) => {
      const chats = chat.getAll();
      chats.onsuccess = () => resolve(chats.result);
      chats.onerror = () => reject(chats.error);
    });
    if (chats instanceof DOMException) throw chats;
    console.log(chats)
    return chats;
  }
  createChat(db: IDBDatabase, name: string) {
    const chat = this._getWriteDbChatObject(db);
    chat.add({ id: uuid(), name, createdAt: new Date() });
  }
  deleteChat(db: IDBDatabase, id: string) {
    const chat = this._getWriteDbChatObject(db);
    chat.delete(id);
  }
  updateChat(
    db: IDBDatabase,
    data: { id: string; name: string; createdAt: Date }
  ) {
    const chat = this._getWriteDbChatObject(db);
    chat.put(data);
  }
}

export default new ChatService();
