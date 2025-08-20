import { DataService } from "@/types/dataService";
import { createLocalDB, DATA_LABEL, DB } from "./createLocalDB";
import { ChangeTypes, LocalChange } from "@/types/change";
import { CHANGE_LABEL } from "@/constants/labels";
import { Data } from "@/types/data/data";
import { v4 as uuid } from "uuid";

export class LocalDBService<T extends Data | LocalChange>
  implements DataService<T>
{
  private _db: DB;
  subscribers: Array<(id: string, type: ChangeTypes) => void>;
  label: typeof DATA_LABEL | typeof CHANGE_LABEL;

  constructor(label: typeof DATA_LABEL | typeof CHANGE_LABEL) {
    this._db = createLocalDB();
    this.label = label;
    this.subscribers = [];
  }

  async getAll() {
    const res = await this._db[this.label].toArray();
    return res as T[];
  }

  async getOne(id: string) {
    const res = await this._db[this.label].get(id);
    return res as T | undefined;
  }

  async create(data: T, notify: boolean = true) {
    //@ts-ignore
    const req = await this._db[this.label].add(data);
    if (notify) this.notifySubscribers(req as string, "create");
    return data as T;
  }

  async delete(id: string, notify: boolean = true) {
    const req = await this._db[this.label].delete(id);
    if (notify) this.notifySubscribers(id, "delete");
    return true;
  }

  async update(
    id: string,
    data: Partial<Omit<T, "id">>,
    notify: boolean = true
  ) {
    const entity = await this.getOne(id);
    if (!entity) throw new Error("no such entity in local db");
    //@ts-ignore
    const req = await this._db[this.label].update(id, {
      ...entity,
      ...data,
    });
    if (notify) this.notifySubscribers(req.toString(), "update");
    return data as T;
  }

  subscribe(callback: (id: string, type: ChangeTypes) => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter((sub) => sub !== callback);
    };
  }

  notifySubscribers(id: string, type: ChangeTypes) {
    this.subscribers.forEach((sub) => sub(id, type));
  }
}
