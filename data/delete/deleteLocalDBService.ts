import { DELETE_LABEL, LocalDBServiceMethods } from "@/constants/labels";
import { LocalDBService } from "../localDB/localDBService";
import {  LocalDataService } from "@/types/dataService.types";

export type IDeleteLocalDBService = LocalDataService<
  LocalDBServiceMethods[typeof DELETE_LABEL]
>& {
  localDBService: LocalDBService<typeof DELETE_LABEL>;
};

export class DeleteLocalDBService implements IDeleteLocalDBService {
  localDBService: LocalDBService<typeof DELETE_LABEL>;
  constructor() {
    this.localDBService = new LocalDBService<typeof DELETE_LABEL>(DELETE_LABEL);
  }
  async getAll() {
    return this.localDBService.getAll();
  }
  async getOne(id: string) {
    return this.localDBService.getOne(id);
  }
  async create(data: LocalDBServiceMethods[typeof DELETE_LABEL]["create"]) {
    return this.localDBService.create(data);
  }
  async update(data: LocalDBServiceMethods[typeof DELETE_LABEL]["update"]) {
    return this.localDBService.update(data);
  }
  async delete(id: string) {
    return this.localDBService.delete(id);
  }
  subscribe(callback: () => void) {
    return this.localDBService.subscribe(callback);
  }
}
