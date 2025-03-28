import DBResPromise from "@/helpers/DBResPromise";

export class DBService<T> {
  private _label: string;
  constructor(label: string) {
    this._label = label;
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
  protected _getReadDbObject(db: IDBDatabase) {
    const transaction = db.transaction(this._label, "readonly");
    const DB = transaction.objectStore(this._label);
    return this._changeDBType(DB);
  }
  protected _getWriteDbObject(db: IDBDatabase) {
    const transaction = db.transaction(this._label, "readwrite");
    const DB = transaction.objectStore(this._label);
    return this._changeDBType(DB);
  }
  protected async getAll(db: IDBDatabase) {
    const DB = this._getReadDbObject(db);
    const req = DB.getAll();
    const res = await DBResPromise(req);
    return res;
  }
  protected async create(db: IDBDatabase, data: T) {
    const DB = this._getWriteDbObject(db);
    const req = DB.add(data);
    await DBResPromise(req);
  }
  protected async delete(db: IDBDatabase, id: string) {
    const DB = this._getWriteDbObject(db);
    const req = DB.delete(id);
    await DBResPromise(req);
  }
  protected async update(db: IDBDatabase, data: T) {
    const DB = this._getWriteDbObject(db);
    const req = DB.put(data);
    await DBResPromise(req);
  }
}
