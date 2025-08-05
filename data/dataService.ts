import { LocalDataService } from "@/types/dataService";
import { LocalDBService } from "./localDB/localDBService";
import { ChangeService } from "./changeService";
import { Data } from "@/types/data/data";
import { ChangeTypes } from "@/types/change";

export type UniType = { id: string; createdAt: Date; editedAt: Date };

export type IDataService = LocalDataService<Data, Data, Data>;

export class DataService implements IDataService {
  localDBService: LocalDBService<Data, Data, Data>;
  changeService: ChangeService;

  constructor(
    localDBService: LocalDBService<Data, Data, Data>,
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
    const res = await this.changeService.create(data);
    return res;
  }

  async update(data: Data) {
    const res = await this.changeService.update(data);
    return res;
  }

  async delete(id: string) {
    const res = await this.changeService.delete(id);
    return res;
  }

  subscribe(callback: (id: string, type: ChangeTypes) => void) {
    return this.localDBService.subscribe(callback);
  }
}
