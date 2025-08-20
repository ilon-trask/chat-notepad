import { ChangeTypes, LocalChange } from "@/types/change";
import { LocalDataService } from "@/types/dataService";
import { LocalDBService } from "./localDB/localDBService";
import { v4 as uuid } from "uuid";
import { Data } from "@/types/data/data";

export type IChangeService = LocalDataService<Data, LocalChange>;

export class ChangeService implements IChangeService {
  constructor(
    private changeDBService: LocalDBService<LocalChange>,
    private dataDBServide: LocalDBService<Data>
  ) {}

  async getAll() {
    const res = (await this.changeDBService.getAll()) as LocalChange[];
    return res.toSorted(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );
  }

  async getOne(id: string) {
    const res = await this.changeDBService.getOne(id);
    return res as LocalChange | undefined;
  }

  async create(data: Data, notify: boolean = true) {
    const res = await this.changeDBService.create(
      {
        id: uuid(),
        data,
        type: "create",
        createdAt: new Date(),
        editedAt: new Date(),
        oldData: undefined,
        synced: true,
        table: data.type,
      },
      notify
    );
    return res;
  }

  async update(
    id: string,
    data: Partial<Omit<Data, "id">>,
    notify: boolean = true
  ) {
    const oldData = await this.dataDBServide.getOne(id);
    if (!oldData) throw new Error("No Item with id " + id + " found");
    const res = await this.changeDBService.create(
      {
        id: uuid(),
        data: { ...oldData, ...data } as Data,
        type: "update",
        createdAt: new Date(),
        editedAt: new Date(),
        oldData,
        synced: true,
        table: oldData.type,
      },
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
        synced: true,
      },
      notify
    );
    return true;
  }
  subscribe(callback: (id: string, type: ChangeTypes) => void) {
    return this.changeDBService.subscribe(callback);
  }
}
