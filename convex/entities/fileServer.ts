import { DefaultServer } from "./deafultServer";
import { Id } from "@/convex/_generated/dataModel";
import { MutationCtx } from "@/convex/_generated/server";
import { ServerEntity } from "./interface";
import { FILE_LABEL,  PLURALS } from "@/constants/labels";

export class FileServer extends DefaultServer implements ServerEntity {
  ctx: MutationCtx;
  constructor(ctx: MutationCtx) {
    super(ctx);
    this.ctx = ctx;
  }

  async delete(id: string) {
    const file = await this.ctx.db
      .query(PLURALS[FILE_LABEL])
      .withIndex("by_my_id", (q) => q.eq("id", id))
      .first();
    if (!file) throw new Error("no such file");
    this.ctx.storage.delete(file.storageId as Id<"_storage">);
    return super.delete(id, FILE_LABEL);
  }
   async getAll() {
      const res = await super.getAll(FILE_LABEL);
      return res;
    }
}
