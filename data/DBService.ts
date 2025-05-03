// import { api } from "@/convex/_generated/api";
// import { Labels } from "./createLocalDB";
// import { localDBService } from "./localDBService";
// import { ConvexReactClient } from "convex/react"
// import { Message } from "@/types/message.types";
// import { ChatDialogStore } from "@/store/chatDialogStore";
// import isOnline from "@/helpers/isOnline";

// export class DBService<T> extends localDBService<T> {
//     private _convexDB: ConvexReactClient;
//     private _label: Labels;

//     constructor(label: Labels, db: IDBDatabase, convexDB: ConvexReactClient) {
//         super(label, db);
//         this._convexDB = convexDB;
//         this._label = label;
//     }

//     async getAll() {
//         if (isOnline()) {
//             const data = await this._convexDB.query(api[this._label].getAll);
//             return data as T[];
//         }
//         return super.getAll();
//     }
//     async create(data: T) {
//         if (isOnline()) {
//             const newData = await this._convexDB.mutation(api[this._label].create, data);
//             return newData as T;
//         }
//         return super.create(data);
//     }

//     async delete(id: string) {
//         {
//             if (isOnline()) {
//                 const deleted = await this._convexDB.mutation(api[this._label].deleteEntry, id);
//                 return deleted as boolean;
//             }
//             return super.delete(id);
//         }
//     }
//     async update() { }
// }