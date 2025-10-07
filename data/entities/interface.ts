import { Labels } from "@/constants/labels";
import { Data, ServerData } from "@/types/data/data";

export interface Entity<T extends Data = Data> {
  set: (data: T[]) => void;
  getOne: (id: string) => Promise<T | undefined>;
  getAll: () => Promise<T[]>;
  create: (data: T) => Promise<T>;
  update: (id: string, data: Partial<T>) => Promise<T>;
  delete: (id: string) => Promise<boolean>;
}

export interface SyncEntity {
  set: (data: Data[]) => void;
  getOne: (id: string) => Data | undefined;
  getAll: () => Data[];
  create: (data: Data) => Data;
  update: (id: string, data: Partial<Data>) => Data;
  delete: (id: string) => boolean;
}

export interface Adapter {
  toServer: (data: Partial<Data>) => Promise<Partial<ServerData>>;
  toClient: (
    data: Partial<ServerData & { type: Labels }>
  ) => Promise<Partial<Data>>;
}
