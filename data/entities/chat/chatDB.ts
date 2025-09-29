import { LocalDBService } from "@/data/localDB/localDBService";
import { DATA_LABEL } from "@/data/localDB/createLocalDB";
import { Data } from "@/types/data/data";
import { MessageDB } from "../message/messageDB";
import { Entity } from "../interface";
import { LocalChat } from "@/types/data/chat";

//@ts-ignore
export class ChatDB extends LocalDBService<LocalChat> implements Entity {
  private messageDB: MessageDB;

  constructor() {
    super(DATA_LABEL);
    this.messageDB = new MessageDB();
  }

  async delete(id: string): Promise<boolean> {
    const allData = (await this.getAll()) as Data[];
    const messages = allData.filter(
      (item) =>
        item.type === "message" && "chatId" in item && item.chatId === id
    );

    await Promise.all(messages.map((msg) => this.messageDB.delete(msg.id)));

    return await super.delete(id);
  }
}
