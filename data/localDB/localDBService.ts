import { DataService } from "@/types/dataService";
import { createLocalDB, DATA_LABEL, DB } from "./createLocalDB";
import { LocalChange } from "@/types/change";
import { CHANGE_LABEL } from "@/constants/labels";
import { Data } from "@/types/data/data";

export class LocalDBService<T extends Data | LocalChange>
  implements DataService<T>
{
  private _db: DB;
  label: typeof DATA_LABEL | typeof CHANGE_LABEL;

  constructor(label: typeof DATA_LABEL | typeof CHANGE_LABEL) {
    this._db = createLocalDB();
    this.label = label;
  }

  set(data: T[]) {
    //@ts-ignore
    this._db[this.label].bulkPut(data);
  }

  async getAll() {
    const res = await this._db[this.label].toArray();
    return res as T[];
  }

  async getOne(id: string) {
    const res = await this._db[this.label].get(id);
    return res as T | undefined;
  }

  async create(data: T) {
    //@ts-ignore
    const req = await this._db[this.label].add(data);
    return data as T;
  }

  async delete(id: string) {
    const req = await this._db[this.label].delete(id);
    return true;
  }

  async update(id: string, data: Partial<Omit<T, "id">>) {
    const entity = await this.getOne(id);
    if (!entity) throw new Error("no such entity in local db");
    //@ts-ignore
    const req = await this._db[this.label].update(id, {
      ...entity,
      ...data,
    });
    return data as T;
  }
}
