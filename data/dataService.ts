import { DataService as IDataService } from "@/types/dataService";
import { LocalDBService } from "./localDB/localDBService";
import { ChangeService } from "./changeService";
import { Data } from "@/types/data/data";
import { SyncEntity } from "./entities/interface";
import { Labels } from "@/constants/labels";

export type UniType = { id: string; createdAt: Date; editedAt: Date };

export class DataService implements IDataService<Data> {
  localDBService: LocalDBService<Data>;
  changeService: ChangeService;
  UIStore: SyncEntity;

  constructor(
    localDBService: LocalDBService<Data>,
    changeDBService: ChangeService,
    UIStore: SyncEntity
  ) {
    this.localDBService = localDBService;
    this.changeService = changeDBService;
    this.UIStore = UIStore;
  }

  async getAll() {
    const res = (await this.localDBService.getAll()) as Data[];
    return res.toSorted(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );
  }

  async getOne(id: string) {
    const res = (await this.localDBService.getOne(id)) as Data;
    return res;
  }

  async create(data: Data) {
    await this.changeService.create(data);
    const optimistic = this.UIStore.create(data);
    return optimistic;
  }

  async update(id: string, data: Partial<Omit<Data, "id">> & { type: Labels }) {
    await this.changeService.update(id, { ...data });
    const optimistic = this.UIStore.update(id, { ...data });
    return optimistic;
  }

  async delete(id: string) {
    await this.changeService.delete(id);
    const optimistic = this.UIStore.delete(id);
    return optimistic;
  }
}
