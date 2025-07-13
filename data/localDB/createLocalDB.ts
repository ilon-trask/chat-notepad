import { ALL_LABELS } from "../../constants/labels";

const DB_VERSION = 2;

export async function createLocalDB(): Promise<IDBDatabase> {
  const db: IDBDatabase | DOMException = await new Promise(
    (resolve, reject) => {
      const request = indexedDB.open("DB", DB_VERSION);
      request.onupgradeneeded = (event) => {
        //@ts-ignore
        const db = event.target?.result;
        ALL_LABELS.forEach((label) => {
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
