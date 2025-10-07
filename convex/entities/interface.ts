import { Labels, PLURALS } from "@/constants/labels";
import { ServerData } from "@/types/data/data";
import { Id } from "../_generated/dataModel";
import { MutationCtx, QueryCtx } from "../_generated/server";

export interface ServerEntity<K extends Labels = Labels> {
  create: (
    ctx: MutationCtx,
    data: ServerData,
    table: Labels
  ) => Promise<Id<(typeof PLURALS)[Labels]>>;
  getOne: (
    ctx: QueryCtx,
    id: Id<(typeof PLURALS)[K]>,
    table: Labels
  ) => Promise<ServerData | null>;
  getAll: (ctx: QueryCtx, table: Labels) => Promise<ServerData[]>;
  update: (
    ctx: MutationCtx,
    id: Id<(typeof PLURALS)[K]>,
    data: Partial<ServerData>,
    table: Labels
  ) => Promise<ServerData | null>;
  delete: (
    ctx: MutationCtx,
    id: Id<(typeof PLURALS)[K]>,
    table: Labels
  ) => Promise<void>;
}
