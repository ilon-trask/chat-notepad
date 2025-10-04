import { CHANGE_LABEL } from "@/constants/labels";
import { MANDATORY_FIELDS } from "@/convex/schema";
import { LocalChange } from "@/types/change";
import { Data } from "@/types/data/data";
import { Dexie, EntityTable } from "dexie";

const DB_VERSION = 4;
export const DATA_LABEL = "data";

export type DB = Dexie & {
  [DATA_LABEL]: EntityTable<Data, "id">;
  [CHANGE_LABEL]: EntityTable<LocalChange, "id">;
};

const db = new Dexie("DB") as DB;

const FIELDS = Object.keys(MANDATORY_FIELDS).join(", ");

db.version(DB_VERSION).stores({
  [DATA_LABEL]: FIELDS,
  [CHANGE_LABEL]: FIELDS,
});

export default db;
