import { ChangeTypes, LocalChange } from "@/types/change";
import { LocalDataService } from "@/types/dataService";
import { LocalDBService } from "./localDB/localDBService";
import { v4 as uuid } from "uuid";
import { Data } from "@/types/data/data";

export type IChangeService = LocalDataService<Data, Data, LocalChange>;

export class ChangeService implements IChangeService {
  constructor(
    private changeDBService: LocalDBService<
      LocalChange,
      LocalChange,
      LocalChange
    >,
    private dataDBServide: LocalDBService<Data, Data, Data>
  ) {}

  async getAll() {
    const res = (await this.changeDBService.getAll()) as LocalChange[];
    return res.toSorted(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );
  }
  
  async getOne(id: string) {
    const res = await this.changeDBService.getOne(id);
    return res as LocalChange;
  }

  async create(data: Data, notify: boolean = true) {
    const res = await this.changeDBService.create(
      {
        data,
        id: uuid(),
        type: "create",
        createdAt: new Date(),
        editedAt: new Date(),
        oldData: undefined,
        synced: false,
        table: data.type,
      } satisfies LocalChange,
      notify
    );
    return res;
  }

  async update(data: Data, notify: boolean = true) {
    const oldData = await this.dataDBServide.getOne(data.id);
    if (!oldData) throw new Error("No Item with id " + data.id + " found");
    const res = await this.changeDBService.create(
      {
        data,
        id: uuid(),
        type: "update",
        createdAt: new Date(),
        editedAt: new Date(),
        oldData,
        synced: false,
        table: data.type,
      } satisfies LocalChange,
      notify
    );
    return res;
  }

  async delete(id: string, notify: boolean = true) {
    const oldData = await this.dataDBServide.getOne(id);
    if (!oldData) throw new Error("No Item with id " + id + " found");
    const res = await this.changeDBService.create(
      {
        id: uuid(),
        data: { id },
        type: "delete",
        createdAt: new Date(),
        editedAt: new Date(),
        oldData,
        table: oldData.type as string,
        synced: false,
      } satisfies LocalChange,
      notify
    );
    return true;
  }
  subscribe(callback: (id: string, type: ChangeTypes) => void) {
    return this.changeDBService.subscribe(callback);
  }
}
