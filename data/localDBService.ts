import DBResPromise from "@/helpers/DBResPromise";
import { CHAT_LABEL, DELETE_LABEL, MESSAGE_LABEL, AllLabels } from "@/constants/labels";
import { DataService } from "@/types/dataService.types";
import { Message } from "@/types/message.types";
import { Chat } from "@/types/chat.types";
import { Delete } from "@/types/delete.types";

const DB_METHODS = ["add", "put", "getAll", "delete", "clear"] as const;

type Methods = {
  [MESSAGE_LABEL]: {
    return: Message,
    create: Message,
    update: Message,
  },
  [CHAT_LABEL]: {
    return: Chat,
    create: Chat,
    update: Chat,
  },
  [DELETE_LABEL]: {
    return: Delete,
    create: Delete,
    update: Delete,
  }
}

export class LocalDBService implements DataService {
  private _db: IDBDatabase;

  constructor(db: IDBDatabase) {
    this._db = db;
  }

  protected _changeDBType<T extends AllLabels>(localDB: IDBObjectStore) {
    type LocalDB = Omit<typeof localDB, typeof DB_METHODS[number]> & {
      add: (value: Methods[T]['create']) => Promise<IDBValidKey>;
      put: (value: Methods[T]['update']) => Promise<IDBValidKey>;
      getAll: () => Promise<Methods[T]['return'][]>;
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
  protected async _getReadDbObject<T extends AllLabels>(label: AllLabels) {
    const transaction = this._db.transaction(label, "readonly");
    const DB = transaction.objectStore(label);
    return this._changeDBType<T>(DB);
  }
  protected async _getWriteDbObject<T extends AllLabels>(label: AllLabels) {
    const transaction = this._db.transaction(label, "readwrite");
    const DB = transaction.objectStore(label);
    return this._changeDBType<T>(DB);
  }

  async getAll<T extends AllLabels>(label: AllLabels) {
    const DB = await this._getReadDbObject<T>(label);
    const res = await DB.getAll();
    return res as Methods[T]['return'][];
  }

  async create<T extends AllLabels>(label: AllLabels, data: Methods[T]['create']) {
    const DB = await this._getWriteDbObject<T>(label);
    const req = await DB.add(data);
    return data;
  }

  async delete(label: AllLabels, id: string) {
    const DB = await this._getWriteDbObject(label);
    const req = await DB.delete(id);
    return true;
  }

  async update<T extends AllLabels>(label: AllLabels, data: Methods[T]['update']) {
    const DB = await this._getWriteDbObject<T>(label);
    const req = await DB.put(data);
    return data;
  }
}

