import { LocalDataService } from "@/types/dataService";
import { LocalDBService } from "./localDB/localDBService";
import { ChangeService } from "./changeService";
import { Data } from "@/types/data/data";
import { ChangeTypes } from "@/types/change";

export type UniType = { id: string; createdAt: Date; editedAt: Date };

export type IDataService = LocalDataService<Data>;

export class DataService implements IDataService {
  localDBService: LocalDBService<Data>;
  changeService: ChangeService;

  constructor(
    localDBService: LocalDBService<Data>,
    changeDBService: ChangeService
  ) {
    this.localDBService = localDBService;
    this.changeService = changeDBService;
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
    const optimistic = await this.localDBService.create(data);
    return optimistic;
  }

  async update(id: string, data: Partial<Omit<Data, "id">>) {
    await this.changeService.update(id, { ...data });
    const optimistic = await this.localDBService.update(id, { ...data });
    return optimistic;
  }

  async delete(id: string) {
    await this.changeService.delete(id);
    const optimistic = await this.localDBService.delete(id);
    return optimistic;
  }

  subscribe(callback: (id: string, type: ChangeTypes) => void) {
    return this.localDBService.subscribe(callback);
  }
}
