import { Labels } from "@/constants/labels";
import { ChangeTypes } from "./change";

type DBRecord = { id: string };

export type DataService<T extends DBRecord, R = T> = {
  getAll: () => Promise<R[]>;
  getOne: (id: T["id"]) => Promise<R | undefined>;
  create: (data: T) => Promise<R>;
  delete: (id: T["id"], type: Labels) => Promise<boolean>;
  update: (
    id: T["id"],
    data: Partial<Omit<T, "id">> & { type: Labels }
  ) => Promise<R>;
};

export type LocalDataService<T extends DBRecord, R = T> = DataService<T, R> & {
  subscribe: (callback: (id: string, type: ChangeTypes) => void) => () => void;
};
