import { api } from "@/convex/_generated/api";
import {
  Labels,
  MESSAGE_LABEL,
  CHAT_LABEL,
  PLURALS,
  FILE_LABEL,
} from "@/constants/labels";
import { ConvexReactClient } from "convex/react";
import { DataService } from "@/types/dataService.types";
import { Doc } from "@/convex/_generated/dataModel";

type Methods = {
  [MESSAGE_LABEL]: {
    return: Doc<"messages">;
    create: typeof api.messages.create._args;
    update: typeof api.messages.update._args;
  };
  [CHAT_LABEL]: {
    return: Doc<"chats">;
    create: typeof api.chats.create._args;
    update: typeof api.chats.update._args;
  };
  [FILE_LABEL]: {
    return: Doc<"files">;
    create: typeof api.files.create._args;
    update: typeof api.files.update._args;
  };
};

export class RemoteDBService<T extends Labels> implements DataService {
  private _convexDB: ConvexReactClient;
  label: T;
  constructor(convexDB: ConvexReactClient, label: T) {
    this._convexDB = convexDB;
    this.label = label;
  }

  async getAll() {
    const res = await this._convexDB.query(api[PLURALS[this.label]].getAll);
    return res as Methods[T]["return"][];
  }

  async getOne(id: string) {
    const res = await this._convexDB.query(api[PLURALS[this.label]].getById, {
      id: id,
    });
    return res as Methods[T]["return"];
  }

  async create(data: Methods[T]["create"]) {
    const res = await this._convexDB.mutation(
      api[PLURALS[this.label]].create,
      data
    );
    return res as Methods[T]["return"];
  }

  async delete(id: string) {
    await this._convexDB.mutation(api[PLURALS[this.label]].deleteEntry, {
      id: id,
    });
    return true;
  }

  async update(data: Methods[T]["update"]) {
    const res = await this._convexDB.mutation(
      api[PLURALS[this.label]].update,
      data
    );
    return res as Methods[T]["return"];
  }
}
