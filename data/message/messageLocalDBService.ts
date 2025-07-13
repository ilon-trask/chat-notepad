import { LocalDBServiceMethods, MESSAGE_LABEL } from "@/constants/labels";
import { LocalDBService } from "../localDB/localDBService";
import { LocalDataService } from "@/types/dataService.types";
import { FileLocalDBService } from "../file/fileLocalDBService";

export type IMessageLocalDBService = LocalDataService<
  LocalDBServiceMethods[typeof MESSAGE_LABEL]
> & {
  localDBService: LocalDBService<typeof MESSAGE_LABEL>;
};

export class MessageLocalDBService implements IMessageLocalDBService {
  private fileLocalDBService: FileLocalDBService;
  localDBService: LocalDBService<typeof MESSAGE_LABEL>;
  constructor(fileLocalDBService: FileLocalDBService) {
    this.fileLocalDBService = fileLocalDBService;
    this.localDBService = new LocalDBService<typeof MESSAGE_LABEL>(
      MESSAGE_LABEL
    );
  }
  async getAll() {
    return this.localDBService.getAll();
  }
  async getOne(id: string) {
    return this.localDBService.getOne(id);
  }
  async create(data: LocalDBServiceMethods[typeof MESSAGE_LABEL]["create"]) {
    return this.localDBService.create(data);
  }
  async update(data: LocalDBServiceMethods[typeof MESSAGE_LABEL]["update"]) {
    return this.localDBService.update(data);
  }
  async delete(messageId: string) {
    const files = await this.fileLocalDBService.getAll();
    for (const file of files) {
      if (file.messageId == messageId) {
        await this.fileLocalDBService.delete(file.id);
      }
    }
    return this.localDBService.delete(messageId);
  }
  subscribe(callback: () => void) {
    return this.localDBService.subscribe(callback);
  }
}
