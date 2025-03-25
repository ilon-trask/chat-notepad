import { useEffect, useState } from "react";

const labels = ["chat", "message"];

export function useDatabase() {
  const [isLoading, setIsLoading] = useState(true);
  const [db, setDb] = useState<IDBDatabase | null>(null);
  useEffect(() => {
    (async () => {
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
      if (db instanceof DOMException) {
        throw db;
      }
      setIsLoading(false);
      setDb(db);
    })();
  }, []);
  return { isLoading, db };
}
