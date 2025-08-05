import { CHANGE_LABEL } from "@/constants/labels";

const DB_VERSION = 3;
export const DATA_LABEL = "data";

export async function createLocalDB(): Promise<IDBDatabase> {
  const db: IDBDatabase | DOMException = await new Promise(
    (resolve, reject) => {
      const request = indexedDB.open("DB", DB_VERSION);
      request.onupgradeneeded = (event) => {
        if (!event.target) throw new Error("localDB not found");
        //@ts-ignore
        const db = event.target.result;
        [DATA_LABEL, CHANGE_LABEL].forEach((lable) => {
          if (!db.objectStoreNames.contains(lable)) {
            db.createObjectStore(lable, { keyPath: "id" });
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
