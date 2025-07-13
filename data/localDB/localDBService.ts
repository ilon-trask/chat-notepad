import DBResPromise from "@/helpers/DBResPromise";
import { AllLabels, LocalDBServiceMethods } from "@/constants/labels";
import { DataService } from "@/types/dataService.types";
import { createLocalDB } from "./createLocalDB";

const DB_METHODS = ["add", "put", "getAll", "delete", "clear"] as const;

//TODO: handle errors when work with indexedDB
export class LocalDBService<T extends AllLabels>
  implements DataService<LocalDBServiceMethods[T]>
{
  private _db: Promise<IDBDatabase>;
  label: T;
  subscribers: Array<() => void>;

  constructor(label: T) {
    this._db = createLocalDB();
    this.label = label;
    this.subscribers = [];
  }

  protected _changeDBType(localDB: Promise<IDBObjectStore>) {
    type LocalDB = Omit<
      Awaited<typeof localDB>,
      (typeof DB_METHODS)[number]
    > & {
      getOne: (id: string) => Promise<LocalDBServiceMethods[T]["return"]>;
      add: (value: LocalDBServiceMethods[T]["create"]) => Promise<IDBValidKey>;
      put: (value: LocalDBServiceMethods[T]["update"]) => Promise<IDBValidKey>;
      getAll: () => Promise<LocalDBServiceMethods[T]["return"][]>;
      delete: (query: string) => Promise<undefined>;
      clear: () => Promise<undefined>;
    };
    return localDB.then((db) => {
      const { put, add, getAll, clear, delete: deleteDB, get, ...rest } = db;

      const newLocalDB = {
        ...rest,
        getOne: async (...args) => await DBResPromise(get.apply(db, args)),
        put: async (...args) => await DBResPromise(put.apply(db, args)),
        getAll: async (...args) => await DBResPromise(getAll.apply(db, args)),
        add: async (...args) => await DBResPromise(add.apply(db, args)),
        clear: async (...args) => await DBResPromise(clear.apply(db, args)),
        delete: async (...args) => await DBResPromise(deleteDB.apply(db, args)),
      } as LocalDB;

      return newLocalDB;
    });
  }

  protected async _getReadDbObject() {
    const transaction = this._db.then((db) =>
      db.transaction(this.label, "readonly")
    );
    const DB = transaction.then((t) => t.objectStore(this.label));
    return this._changeDBType(DB);
  }

  protected async _getWriteDbObject() {
    const transaction = this._db.then((db) =>
      db.transaction(this.label, "readwrite")
    );
    const DB = transaction.then((t) => t.objectStore(this.label));
    return this._changeDBType(DB);
  }

  async getAll() {
    const DB = await this._getReadDbObject();
    const res = await DB.getAll();
    return res satisfies LocalDBServiceMethods[T]["return"][];
  }

  async getOne(id: string) {
    const DB = await this._getReadDbObject();
    const res = await DB.getOne(id);
    return res satisfies LocalDBServiceMethods[T]["return"];
  }

  async create(data: LocalDBServiceMethods[T]["create"]) {
    const DB = await this._getWriteDbObject();
    const req = await DB.add(data);
    this.notifySubscribers();
    return data;
  }

  async delete(id: string) {
    const DB = await this._getWriteDbObject();
    const req = await DB.delete(id);
    this.notifySubscribers();
    return true;
  }

  async update(data: LocalDBServiceMethods[T]["update"]) {
    const DB = await this._getWriteDbObject();
    const req = await DB.put(data);
    this.notifySubscribers();
    return data;
  }

  subscribe(callback: () => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter((sub) => sub !== callback);
    };
  }
  notifySubscribers() {
    this.subscribers.forEach((sub) => sub());
  }
}
