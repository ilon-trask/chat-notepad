import { DefaultServer } from "./deafultServer";
import { MESSAGE_LABEL, PLURALS } from "@/constants/labels";
import { Labels, FILE_LABEL } from "@/constants/labels";
import { FileServer } from "./fileServer";
import { MutationCtx } from "@/convex/_generated/server";
import { ServerEntity } from "./interface";

export class MessageServer extends DefaultServer implements ServerEntity {
  private fileServer: FileServer;

  constructor(ctx: MutationCtx) {
    super(ctx);
    this.fileServer = new FileServer(ctx);
  }

  async delete(id: string, table: Labels) {
    const files = await this.ctx.db
      .query(PLURALS[FILE_LABEL])
      .filter((q) => q.eq(q.field("messageId"), id))
      .collect();

    await Promise.all(files.map((file) => this.fileServer.delete(file.id)));

    return super.delete(id, table);
  }
  async getAll() {
    const res = await super.getAll(MESSAGE_LABEL);
    return res;
  }
}
