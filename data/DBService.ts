import DBResPromise from "@/helpers/DBResPromise";
import { createDB } from "./db";

export class DBService<T> {
  private _label: string;
  private _db: Promise<IDBDatabase>;

  constructor(label: string) {
    this._label = label;
    this._db = createDB();
  }

  protected _changeDBType(chatDB: IDBObjectStore) {
    type ChatDB = Omit<typeof chatDB, "add" | "put" | "getAll"> & {
      add: (value: T, key?: IDBValidKey) => IDBRequest<IDBValidKey>;
      put: (value: T, key?: IDBValidKey) => IDBRequest<IDBValidKey>;
      getAll: (
        query?: IDBValidKey | IDBKeyRange | null,
        count?: number
      ) => IDBRequest<T[]>;
    };
    return chatDB as ChatDB;
  }

  protected async _getReadDbObject() {
    const transaction = (await this._db).transaction(this._label, "readonly");
    const DB = transaction.objectStore(this._label);
    return this._changeDBType(DB);
  }

  protected async _getWriteDbObject() {
    const transaction = (await this._db).transaction(this._label, "readwrite");
    const DB = transaction.objectStore(this._label);
    return this._changeDBType(DB);
  }

  async getAll() {
    const DB = await this._getReadDbObject();
    const req = DB.getAll();
    const res = await DBResPromise(req);
    return res;
  }

  async create(data: T) {
    const DB = await this._getWriteDbObject();
    const req = DB.add(data);
    await DBResPromise(req);
  }

  async delete(id: string) {
    const DB = await this._getWriteDbObject();
    const req = DB.delete(id);
    await DBResPromise(req);
  }

  async deleteAll() {
    const DB = await this._getWriteDbObject();
    const req = DB.clear();
    await DBResPromise(req);
  }

  async update(data: T) {
    const DB = await this._getWriteDbObject();
    const req = DB.put(data);
    await DBResPromise(req);
  }
}
