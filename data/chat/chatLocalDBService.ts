import { CHAT_LABEL, LocalDBServiceMethods } from "@/constants/labels";
import { MessageLocalDBService } from "../message/messageLocalDBService";
import { LocalDBService } from "../localDB/localDBService";
import { LocalDataService } from "@/types/dataService.types";

export type IChatLocalDBService = LocalDataService<
  LocalDBServiceMethods[typeof CHAT_LABEL]
> & {
  localDBService: LocalDBService<typeof CHAT_LABEL>;
};

export class ChatLocalDBService implements IChatLocalDBService {
  private messaageLocalDBService: MessageLocalDBService;
  localDBService: LocalDBService<typeof CHAT_LABEL>;

  constructor(messaageLocalDBService: MessageLocalDBService) {
    this.messaageLocalDBService = messaageLocalDBService;
    this.localDBService = new LocalDBService<typeof CHAT_LABEL>(CHAT_LABEL);
  }

  async getAll() {
    return this.localDBService.getAll();
  }
  async getOne(id: string) {
    return this.localDBService.getOne(id);
  }
  async create(data: LocalDBServiceMethods[typeof CHAT_LABEL]["create"]) {
    return this.localDBService.create(data);
  }
  async update(data: LocalDBServiceMethods[typeof CHAT_LABEL]["update"]) {
    return this.localDBService.update(data);
  }
  async delete(chatId: string) {
    const messages = await this.messaageLocalDBService.getAll();
    for (const message of messages) {
      if (message.chatId == chatId) {
        await this.messaageLocalDBService.delete(message.id);
      }
    }
    return this.localDBService.delete(chatId);
  }
  subscribe(callback: () => void) {
    return this.localDBService.subscribe(callback);
  }
}
