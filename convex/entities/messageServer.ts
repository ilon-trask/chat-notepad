import { DefaultServer } from "./deafultServer";
import { MESSAGE_LABEL, PLURALS } from "@/constants/labels";
import { Labels, FILE_LABEL } from "@/constants/labels";
import { FileServer } from "./fileServer";
import { MutationCtx, QueryCtx } from "@/convex/_generated/server";
import { ServerEntity } from "./interface";

export class MessageServer extends DefaultServer implements ServerEntity {
  private fileServer: FileServer = new FileServer();

  constructor() {
    super();
    this.fileServer = new FileServer();
  }
  async delete(ctx: MutationCtx, id: string, table: Labels) {
    const files = await ctx.db
      .query(PLURALS[FILE_LABEL])
      .filter((q) => q.eq(q.field("messageId"), id))
      .collect();

    await Promise.all(
      files.map((file) => this.fileServer.delete(ctx, file.id))
    );

    return super.delete(ctx, id, table);
  }
  async getAll(ctx: QueryCtx) {
    const res = await super.getAll(ctx, MESSAGE_LABEL);
    return res;
  }
}
