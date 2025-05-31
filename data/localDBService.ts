import DBResPromise from "@/helpers/DBResPromise";
import { Labels } from "@/constants/labels";
import { DataService } from "@/types/dataService.types";

const DB_METHODS = ["add", "put", "getAll", "delete", "clear"] as const;

export class LocalDBService implements DataService {
  private _db: IDBDatabase;

  constructor(db: IDBDatabase) {
    this._db = db;
  }

  protected _changeDBType<T>(localDB: IDBObjectStore) {
    type LocalDB = Omit<typeof localDB, typeof DB_METHODS[number]> & {
      add: (value: T) => Promise<IDBValidKey>;
      put: (value: T) => Promise<IDBValidKey>;
      getAll: () => Promise<T[]>;
      delete: (query: string) => Promise<undefined>
      clear: () => Promise<undefined>
    };
    const { put, add, getAll, clear, delete: deleteDB, ...rest } = localDB;

    const newLocalDB = {
      ...rest,
      put: async (...args) => await DBResPromise(put.apply(localDB, args)),
      getAll: async (...args) => await DBResPromise(getAll.apply(localDB, args)),
      add: async (...args) => await DBResPromise(add.apply(localDB, args)),
      clear: async (...args) => await DBResPromise(clear.apply(localDB, args)),
      delete: async (...args) => await DBResPromise(deleteDB.apply(localDB, args)),
    } as LocalDB;

    return newLocalDB;
  }
  protected async _getReadDbObject<T>(label: Labels) {
    const transaction = this._db.transaction(label, "readonly");
    const DB = transaction.objectStore(label);
    return this._changeDBType<T>(DB);
  }
  protected async _getWriteDbObject<T>(label: Labels) {
    const transaction = this._db.transaction(label, "readwrite");
    const DB = transaction.objectStore(label);
    return this._changeDBType<T>(DB);
  }

  async getAll<T>(label: Labels) {
    const DB = await this._getReadDbObject<T>(label);
    const res = await DB.getAll();
    return res;
  }

  async create<T>(label: Labels, data: T) {
    const DB = await this._getWriteDbObject<T>(label);
    const req = await DB.add(data);
    return data;
  }

  async delete(label: Labels, id: string) {
    const DB = await this._getWriteDbObject(label);
    const req = await DB.delete(id);
    return true;
  }

  async update<T>(label: Labels, data: T) {
    const DB = await this._getWriteDbObject<T>(label);
    const req = await DB.put(data);
    return data;
  }
}

