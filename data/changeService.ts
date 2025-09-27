import { ChangeTypes, LocalChange } from "@/types/change";
import { LocalDataService } from "@/types/dataService";
import { LocalDBService } from "./localDB/localDBService";
import { v4 as uuid } from "uuid";
import { Data } from "@/types/data/data";
import { Labels } from "@/constants/labels";

export type IChangeService = LocalDataService<Data, LocalChange>;

export class ChangeService implements IChangeService {
  subscribers: Array<(id: string, type: ChangeTypes) => void>;

  constructor(
    private changeDBService: LocalDBService<LocalChange>,
    private dataDBServide: LocalDBService<Data>
  ) {
    this.subscribers = [];
  }

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

  async create(data: Data) {
    const changes = await this.changeDBService.getAll();
    changes.sort((a, b) => Number(a.index - b.index));
    const res = await this.changeDBService.create({
      id: uuid(),
      data,
      type: "create",
      createdAt: new Date(),
      editedAt: new Date(),
      synced: false,
      table: data.type,
      index: BigInt(changes.at(-1)?.index ?? -1) + BigInt(1),
    });
    this.notifySubscribers(res.id, res.type);
    return res;
  }

  async update(id: string, data: Partial<Omit<Data, "id">> & { type: Labels }) {
    const changes = await this.changeDBService.getAll();
    changes.sort((a, b) => Number(a.index - b.index));
    const res = await this.changeDBService.create({
      id: uuid(),
      data: { id, ...data } as Partial<Data> & { id: string },
      type: "update",
      createdAt: new Date(),
      editedAt: new Date(),
      synced: false,
      table: data.type,
      index: BigInt(changes.at(-1)?.index ?? -1) + BigInt(1),
    });
    this.notifySubscribers(res.id, res.type);
    return res;
  }

  async delete(id: string) {
    const data = await this.dataDBServide.getOne(id);
    if (!data) throw new Error("No Item with id " + id + " found");
    const changes = await this.changeDBService.getAll();
    changes.sort((a, b) => Number(a.index - b.index));
    const res = await this.changeDBService.create({
      id: uuid(),
      data: { id },
      type: "delete",
      createdAt: new Date(),
      editedAt: new Date(),
      table: data.type,
      synced: false,
      index: BigInt(changes.at(-1)?.index ?? -1) + BigInt(1),
    });
    this.notifySubscribers(res.id, res.type);
    return true;
  }

  subscribe(callback: (id: string, type: ChangeTypes) => void) {
    this.subscribers.push(callback);
    return () => this.subscribers.filter((sub) => sub !== callback);
  }
  notifySubscribers(id: string, type: ChangeTypes) {
    this.subscribers.forEach((sub) => sub(id, type));
  }
}
