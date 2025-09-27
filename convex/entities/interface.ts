import { Labels, PLURALS } from "@/constants/labels";
import { ServerData } from "@/types/data/data";
import { Id } from "../_generated/dataModel";

export interface ServerEntity<K extends Labels = Labels> {
    create: (
        data: ServerData,
        table: Labels
    ) => Promise<Id<(typeof PLURALS)[Labels]>>;
    getOne: (
        id: Id<(typeof PLURALS)[K]>,
        table: Labels
    ) => Promise<ServerData | null>;
    // getAll: (table: Labels) => Promise<ServerData[]>;
    update: (
        id: Id<(typeof PLURALS)[K]>,
        data: Partial<ServerData>,
        table: Labels
    ) => Promise<ServerData | null>;
    delete: (id: Id<(typeof PLURALS)[K]>, table: Labels) => Promise<void>;
}
