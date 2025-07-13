import { FILE_LABEL, LocalDBServiceMethods } from "@/constants/labels";
import { LocalDBService } from "../localDB/localDBService";
import {  LocalDataService } from "@/types/dataService.types";

export type IFileLocalDBService = LocalDataService<
  LocalDBServiceMethods[typeof FILE_LABEL]
>& {
  localDBService: LocalDBService<typeof FILE_LABEL>;
};

export class FileLocalDBService implements IFileLocalDBService {
  localDBService: LocalDBService<typeof FILE_LABEL>;
  constructor() {
    this.localDBService = new LocalDBService<typeof FILE_LABEL>(FILE_LABEL);
  }
  async getAll() {
    return this.localDBService.getAll();
  }
  async getOne(id: string) {
    return this.localDBService.getOne(id);
  }
  async create(data: LocalDBServiceMethods[typeof FILE_LABEL]["create"]) {
    return this.localDBService.create(data);
  }
  async update(data: LocalDBServiceMethods[typeof FILE_LABEL]["update"]) {
    return this.localDBService.update(data);
  }
  async delete(id: string) {
    return this.localDBService.delete(id);
  }
  subscribe(callback: () => void) {
    return this.localDBService.subscribe(callback);
  }
}
