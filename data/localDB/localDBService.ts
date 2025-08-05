import { DataService } from "@/types/dataService";
import { createLocalDB, DATA_LABEL } from "./createLocalDB";
import { ChangeTypes } from "@/types/change";
import { CHANGE_LABEL } from "@/constants/labels";

const DB_METHODS = ["add", "put", "getAll", "delete", "clear"] as const;

export class LocalDBService<TCreate, TUpdate, TReturn extends TCreate | TUpdate>
  implements DataService<TCreate, TUpdate, TReturn>
{
  private _db: Promise<IDBDatabase>;
  subscribers: Array<(id: string, type: ChangeTypes) => void>;
  label: typeof DATA_LABEL | typeof CHANGE_LABEL;

  constructor(label: typeof DATA_LABEL | typeof CHANGE_LABEL) {
    this._db = createLocalDB();
    this.label = label;
    this.subscribers = [];
  }

  async DBResPromise<T>(req: IDBRequest<T>): Promise<T> {
    const res = await new Promise((resolve, reject) => {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    if (res instanceof DOMException) throw res;
    return res as T;
  }

  protected _changeDBType(localDB: Promise<IDBObjectStore>) {
    type LocalDB = Omit<
      Awaited<typeof localDB>,
      (typeof DB_METHODS)[number]
    > & {
      getOne: (id: string) => Promise<TReturn | undefined>;
      add: (value: TCreate) => Promise<IDBValidKey>;
      put: (value: TUpdate) => Promise<IDBValidKey>;
      getAll: () => Promise<TReturn[]>;
      delete: (id: string) => Promise<undefined>;
      clear: () => Promise<undefined>;
    };
    return localDB.then((db) => {
      const { put, add, getAll, clear, delete: deleteDB, get, ...rest } = db;
      const newLocalDB = {
        ...rest,
        getOne: async (...args) => await this.DBResPromise(get.apply(db, args)),
        put: async (...args) => await this.DBResPromise(put.apply(db, args)),
        getAll: async (...args) =>
          await this.DBResPromise(getAll.apply(db, args)),
        add: async (...args) => await this.DBResPromise(add.apply(db, args)),
        clear: async (...args) =>
          await this.DBResPromise(clear.apply(db, args)),
        delete: async (...args) =>
          await this.DBResPromise(deleteDB.apply(db, args)),
      } as LocalDB;

      return newLocalDB;
    });
  }

  protected async _getStore(mode: "readonly" | "readwrite") {
    const transaction = this._db.then((db) => db.transaction(this.label, mode));
    const DB = transaction.then((t) => t.objectStore(this.label));
    return this._changeDBType(DB);
  }

  async getAll() {
    const DB = await this._getStore("readonly");
    const res = await DB.getAll();
    return res;
  }

  async getOne(id: string) {
    const DB = await this._getStore("readonly");
    const res = await DB.getOne(id);
    return res;
  }

  async create(data: TCreate, notify: boolean = true) {
    console.log("create update", data);
    const DB = await this._getStore("readwrite");
    const req = await DB.add(data);
    if (notify) this.notifySubscribers(req as string, "create");
    return data as TReturn;
  }

  async delete(id: string, notify: boolean = true) {
    const DB = await this._getStore("readwrite");
    const req = await DB.delete(id);
    if (notify) this.notifySubscribers(id, "delete");
    return true;
  }

  async update(data: TUpdate, notify: boolean = true) {
    console.log("change update", data);
    const DB = await this._getStore("readwrite");
    const req = await DB.put(data);
    if (notify) this.notifySubscribers(req as string, "update");
    return data as TReturn;
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
