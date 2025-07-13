import { api } from "@/convex/_generated/api";
import {
  Labels,
  PLURALS,
  FILE_LABEL,
  MESSAGE_LABEL,
  CHAT_LABEL,
} from "@/constants/labels";
import { ConvexReactClient } from "convex/react";
import { DataService } from "@/types/dataService.types";
import { LocalMessage } from "@/types/message.types";
import { LocalChat } from "@/types/chat.types";
import { LocalFileType } from "@/types/file.types";

export type Methods = {
  [MESSAGE_LABEL]: {
    return: LocalMessage;
    create: typeof api.messages.create._args;
    update: typeof api.messages.update._args;
  };
  [CHAT_LABEL]: {
    return: LocalChat;
    create: typeof api.chats.create._args;
    update: typeof api.chats.update._args;
  };
  [FILE_LABEL]: {
    return: Omit<LocalFileType, "file">;
    create: typeof api.files.create._args;
    update: typeof api.files.update._args;
  };
};

export class RemoteDBService<T extends Labels>
  implements DataService<Methods[T]>
{
  private _db: ConvexReactClient;
  label: T;
  constructor(db: ConvexReactClient, label: T) {
    this._db = db;
    this.label = label;
  }

  private async remoteToLocalEntity(value: any): Promise<Methods[T]["return"]> {
    const newRes = {
      ...value,
      createdAt: new Date(value.createdAt),
      editedAt: new Date(value.editedAt),
      status: "server",
    } as const;
    return newRes satisfies Methods[T]["return"];
  }
  async getAll(): Promise<Methods[T]["return"][]> {
    const res = await this._db.query(api[PLURALS[this.label]].getAll);
    const newRes = await Promise.all(
      res.map(async (el) => await this.remoteToLocalEntity(el))
    );
    return newRes satisfies Methods[T]["return"][];
  }

  async getOne(id: string): Promise<Methods[T]["return"]> {
    const res = await this._db.query(api[PLURALS[this.label]].getById, {
      id: id,
    });
    const newRes = await this.remoteToLocalEntity(res);
    return newRes satisfies Methods[T]["return"];
  }

  async create(data: Methods[T]["create"]): Promise<Methods[T]["return"]> {
    const res = await this._db.mutation(api[PLURALS[this.label]].create, data);
    const newRes = await this.remoteToLocalEntity(res);
    return newRes satisfies Methods[T]["return"];
  }

  async delete(id: string) {
    await this._db.mutation(api[PLURALS[this.label]].deleteEntry, {
      id: id,
    });
    return true;
  }

  async update(data: Methods[T]["update"]): Promise<Methods[T]["return"]> {
    const res = await this._db.mutation(api[PLURALS[this.label]].update, data);
    const newRes = await this.remoteToLocalEntity(res);
    return newRes satisfies Methods[T]["return"];
  }
}
