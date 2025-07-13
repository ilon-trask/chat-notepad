import {
  DELETE_LABEL,
  Labels,
  LocalDBServiceMethods,
} from "@/constants/labels";
import isOnline from "@/helpers/isOnline";
import { DataService, LocalDataService } from "@/types/dataService.types";
import { v4 as uuid } from "uuid";

export class DBService<T extends Labels>
  implements DataService<LocalDBServiceMethods[T]>
{
  localDBService: LocalDataService<LocalDBServiceMethods[T]>;
  remoteDBService: DataService<LocalDBServiceMethods[T]>;
  private deleteService: DataService<
    LocalDBServiceMethods[typeof DELETE_LABEL]
  >;
  label: Labels;

  constructor(
    localDBService: LocalDataService<LocalDBServiceMethods[T]>,
    remoteDBService: DataService<LocalDBServiceMethods[T]>,
    deleteService: DataService<LocalDBServiceMethods[typeof DELETE_LABEL]>,
    label: Labels
  ) {
    this.localDBService = localDBService;
    this.remoteDBService = remoteDBService;
    this.deleteService = deleteService;
    this.label = label;
  }

  async getAll() {
    const messages = await this.localDBService.getAll();
    return messages.toSorted(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );
  }

  getOne(id: string) {
    return this.localDBService.getOne(id);
  }

  async create(data: LocalDBServiceMethods[T]["create"]) {
    await this.localDBService.create(data);

    if (isOnline()) {
      this.remoteDBService.create(data).then(async (el) => {
        await this.localDBService.update(el);
      });
    }
    return data;
  }

  async delete(id: string) {
    const message = await this.localDBService.getOne(id);

    if (isOnline()) {
      this.remoteDBService.delete(message.id);
    } else {
      await this.deleteService.create({
        id: uuid(),
        entityId: id,
        type: this.label,
      });
    }
    await this.localDBService.delete(id);
    return true;
  }

  async update(data: LocalDBServiceMethods[T]["update"]) {
    if (isOnline()) {
      await this.remoteDBService.update(data).then(async (el) => {
        await this.localDBService.update(el);
      });
    }
    return await this.localDBService.update(data);
  }
}
