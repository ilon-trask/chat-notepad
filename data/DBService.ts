import DBResPromise from "@/helpers/DBResPromise";
import { Labels } from "./createLocalDB";

const DB_METHODS = ["add", "put", "getAll", "delete", "clear"] as const;

export class DBService<T> {
  private _label: Labels;
  private _db: IDBDatabase;

  constructor(label: Labels, db: IDBDatabase) {
    this._label = label;
    this._db = db;
  }

  protected _changeDBType(localDB: IDBObjectStore) {
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
  protected async _getReadDbObject() {
    const transaction = this._db.transaction(this._label, "readonly");
    const DB = transaction.objectStore(this._label);
    return this._changeDBType(DB);
  }
  protected async _getWriteDbObject() {
    const transaction = this._db.transaction(this._label, "readwrite");
    const DB = transaction.objectStore(this._label);
    return this._changeDBType(DB);
  }

  async getAll() {
    const DB = await this._getReadDbObject();
    const res = await DB.getAll();
    return res;
  }

  async create(data: T) {
    const DB = await this._getWriteDbObject();
    const req = await DB.add(data);
  }

  async delete(id: string) {
    const DB = await this._getWriteDbObject();
    const req = await DB.delete(id);
  }

  async deleteAll() {
    const DB = await this._getWriteDbObject();
    const req = await DB.clear();
  }

  async update(data: T) {
    const DB = await this._getWriteDbObject();
    const req = await DB.put(data);
  }
}
