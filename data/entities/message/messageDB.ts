import { LocalDBService } from "@/data/localDB/localDBService";
import { LocalMessage } from "@/types/data/message";
import { DATA_LABEL } from "@/data/localDB/createLocalDB";
import { Data } from "@/types/data/data";
import { Entity } from "../interface";

export class MessageDB
  extends LocalDBService<LocalMessage>
  implements Entity<LocalMessage>
{
  constructor() {
    super(DATA_LABEL);
  }

  async delete(id: string): Promise<boolean> {
    const message = await this.getOne(id);
    if (message) {
      const allData = (await this.getAll()) as Data[];
      const attachedFiles = allData.filter(
        (item) => item.type === "file" && item.messageId === id
      );

      await Promise.all(attachedFiles.map((file) => super.delete(file.id)));
    }

    return await super.delete(id);
  }
}
