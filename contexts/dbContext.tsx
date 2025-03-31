'use client'
import { useDatabase } from "@/hooks/useDatabase";
import { createContext, useContext } from "react";

export const dbContext = createContext<IDBDatabase | null>(null);

export function useDBContext() {
  const db = useContext(dbContext);
  if (!db) {
    throw new Error("useDatabase must be used within a dbContext");
  }
  return db;
}

export function DbProvider({ children }: { children: React.ReactNode }) {
  const { isLoading, db } = useDatabase();
  if (isLoading) return <div>Loading...</div>;
  if (!db) throw new Error("Database not found");
  return <dbContext.Provider value={db}>{children}</dbContext.Provider>;
}
