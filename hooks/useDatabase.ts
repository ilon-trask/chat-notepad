import { createDB } from "@/data/db";
import { useEffect, useState } from "react";

export function useDatabase() {
  const [isLoading, setIsLoading] = useState(true);
  const [db, setDb] = useState<IDBDatabase | null>(null);
  useEffect(() => {
    createDB().then((db) => {
      setIsLoading(false);
      setDb(db);
    });
  }, []);
  return { isLoading, db };
}
