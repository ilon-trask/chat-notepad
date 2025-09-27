import { Labels, PLURALS } from "@/constants/labels";
import { Id } from "@/convex/_generated/dataModel";
import { Data, ServerData } from "@/types/data/data";

export interface Entity {
  set: (data: Data[]) => void;
  getOne: (id: string) => Promise<Data | undefined>;
  getAll: () => Promise<Data[]>;
  create: (data: Data) => Promise<Data>;
  update: (id: string, data: Partial<Data>) => Promise<Data>;
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
  toClient: (data: Partial<ServerData>) => Promise<Partial<Data>>;
}
