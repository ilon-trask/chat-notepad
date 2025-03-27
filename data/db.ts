import { CHAT_LABEL } from "./chatService";

const labels = [CHAT_LABEL, "message"];

export async function createDB(): Promise<IDBDatabase> {
  const db: IDBDatabase | DOMException = await new Promise(
    (resolve, reject) => {
      const request = indexedDB.open("DB", 1);
      request.onupgradeneeded = (event) => {
        const db = event.target?.result;
        labels.forEach((label) => {
          if (!db.objectStoreNames.contains(label)) {
            db.createObjectStore(label, { keyPath: "id" });
          }
        });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    }
  );
  if (db instanceof DOMException) throw db;
  return db;
}
