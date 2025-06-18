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
import { Message } from "@/types/message.types";
import { Chat } from "@/types/chat.types";
import { FileType } from "@/types/file.types";

type Methods = {
  [MESSAGE_LABEL]: {
    return: Message;
    create: typeof api.messages.create._args;
    update: typeof api.messages.update._args;
  };
  [CHAT_LABEL]: {
    return: Chat;
    create: typeof api.chats.create._args;
    update: typeof api.chats.update._args;
  };
  [FILE_LABEL]: {
    return: FileType;
    create: typeof api.files.create._args;
    update: typeof api.files.update._args;
  };
};

export class RemoteDBService implements DataService {
  private _convexDB: ConvexReactClient;

  constructor(convexDB: ConvexReactClient) {
    this._convexDB = convexDB;
  }

  async getAll<T extends Labels>(label: Labels) {
    const res = await this._convexDB.query(api[PLURALS[label]].getAll);
    return res.map((el) => ({
      ...el,
      createdAt: new Date(el.createdAt),
      editedAt: new Date(el.editedAt),
    })) as Methods[T]["return"][];
  }

  async getOne<T extends Labels>(label: Labels, id: string) {
    const res = await this._convexDB.query(api[PLURALS[label]].getById, {
      id: id as any,
    });
    return {
      ...res,
      createdAt: new Date(res.createdAt),
      editedAt: new Date(res.editedAt),
    } as Methods[T]["return"];
  }

  async create<T extends Labels>(label: Labels, data: Methods[T]["create"]) {
    const res = await this._convexDB.mutation(api[PLURALS[label]].create, data);
    return {
      ...res,
      createdAt: new Date(res.createdAt),
      editedAt: new Date(res.editedAt),
    } as Methods[T]["return"];
  }

  async delete(label: Labels, id: string) {
    await this._convexDB.mutation(api[PLURALS[label]].deleteEntry, {
      _id: id as any,
    });
    return true;
  }
  async update<T extends Labels>(label: Labels, data: Methods[T]["update"]) {
    if (!data._id) throw new Error("Chat not found in remoteDB");
    const res = await this._convexDB.mutation(api[PLURALS[label]].update, data);
    return {
      ...res,
      createdAt: new Date(res.createdAt),
      editedAt: new Date(res.editedAt),
    } as Methods[T]["return"];
  }
}
