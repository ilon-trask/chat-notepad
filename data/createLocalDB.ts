export const CHAT_LABEL = "chat" as const;
export const MESSAGE_LABEL = "message" as const;

const LABELS = [CHAT_LABEL, MESSAGE_LABEL] as const;
export const PLURALS = { 'chat': "chats", 'message': "messages" } as const;

export type Labels = typeof LABELS[number];

export async function createLocalDB(): Promise<IDBDatabase> {
  const db: IDBDatabase | DOMException = await new Promise(
    (resolve, reject) => {
      const request = indexedDB.open("DB", 1);
      request.onupgradeneeded = (event) => {
        //@ts-ignore
        const db = event.target?.result;
        LABELS.forEach((label) => {
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
