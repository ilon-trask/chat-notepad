import DBResPromise from "@/helpers/DBResPromise";
import { createDB } from "./db";

export class DBService<T> {
  private _label: string;
  private _db: IDBDatabase;

  constructor(label: string) {
    this._label = label;
    this._db = {} as IDBDatabase; // Initialize with empty object to satisfy TypeScript

    // Initialize the database asynchronously
    (async () => {
      this._db = await createDB();
    })();
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

  protected _getReadDbObject() {
    const transaction = this._db.transaction(this._label, "readonly");
    const DB = transaction.objectStore(this._label);
    return this._changeDBType(DB);
  }

  protected _getWriteDbObject() {
    const transaction = this._db.transaction(this._label, "readwrite");
    const DB = transaction.objectStore(this._label);
    return this._changeDBType(DB);
  }

  protected async getAll() {
    const DB = this._getReadDbObject();
    const req = DB.getAll();
    const res = await DBResPromise(req);
    return res;
  }

  protected async create(data: T) {
    const DB = this._getWriteDbObject();
    const req = DB.add(data);
    await DBResPromise(req);
  }

  protected async delete(id: string) {
    const DB = this._getWriteDbObject();
    const req = DB.delete(id);
    await DBResPromise(req);
  }

  protected async update(data: T) {
    const DB = this._getWriteDbObject();
    const req = DB.put(data);
    await DBResPromise(req);
  }
}
