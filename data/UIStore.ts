import { create } from "zustand";
import { SyncEntity } from "./entities/interface";
import { Data } from "@/types/data/data";

interface UI extends SyncEntity {
  data: Data[];
}

const useUIStore = create<UI>()((set, get) => ({
  data: [],
  set: (data: Data[]) => {
    set({ data });
  },
  create: (data: Data) => {
    set((prev) => ({ ...prev, data: [...prev.data, data] }));
    return data;
  },
  getOne: (id: string) => {
    const data = get().data;
    return data.find((el) => el.id == id);
  },
  delete: (id: string) => {
    set((prev) => ({
      ...prev,
      data: prev.data.filter((el) => el.id !== id),
    }));
    return true;
  },
  getAll: () => {
    return get().data;
  },
  update: (id: string, data: Partial<Data>) => {
    const current = get().data.find((el) => el.id == id);
    if (!current) throw new Error("no such item");
    const next: Data = { ...current };

    for (const key in data) {
      if (data[key as keyof Data] !== undefined) {
        //@ts-ignore
        next[key as keyof Data] = data[key as keyof Data];
      }
    }
    set((prev) => ({
      ...prev,
      data: prev.data.map((el) => (el.id === id ? next : el)),
    }));
    return get().data.find((el) => el.id == id) as Data;
  },
}));

export default useUIStore;
