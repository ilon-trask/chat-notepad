import { api } from "@/convex/_generated/api";
import { Labels, MESSAGE_LABEL, CHAT_LABEL, PLURALS } from "@/constants/labels";
import { ConvexReactClient } from "convex/react"
import { DataService } from "@/types/dataService.types";
import { Doc } from "@/convex/_generated/dataModel";

type Methods = {
    [MESSAGE_LABEL]: {
        return: Doc<typeof PLURALS[typeof MESSAGE_LABEL]>,
        create: typeof api.messages.create._args,
        update: typeof api.messages.update._args,
    },
    [CHAT_LABEL]: {
        return: Doc<typeof PLURALS[typeof CHAT_LABEL]>,
        create: typeof api.chats.create._args,
        update: typeof api.chats.update._args,
    },
}

export class RemoteDBService implements DataService {
    private _convexDB: ConvexReactClient;

    constructor(convexDB: ConvexReactClient) {
        this._convexDB = convexDB;
    }

    async getAll<T extends Labels>(label: Labels) {
        const res = await this._convexDB.query(api[PLURALS[label]].getAll);
        return res as Methods[T]['return'][];
    }
    async create<T extends Labels>(label: Labels, data: Methods[T]['create']) {
        const res = await this._convexDB.mutation(api[PLURALS[label]].create, data);
        return res as Methods[T]['return'];
    }

    async delete(label: Labels, id: string) {
        await this._convexDB.mutation(api[PLURALS[label]].deleteEntry, { _id: id as any });
        return true;
    }
    async update<T extends Labels>(label: Labels, data: Methods[T]['update']) {
        if (!data._id) throw new Error("Chat not found in convex");
        const res = await this._convexDB.mutation(api[PLURALS[label]].update, data);
        return res as Methods[T]['return'];
    }
}
