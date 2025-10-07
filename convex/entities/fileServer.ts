import { DefaultServer } from "./deafultServer";
import { Id } from "@/convex/_generated/dataModel";
import { MutationCtx, QueryCtx } from "@/convex/_generated/server";
import { ServerEntity } from "./interface";
import { FILE_LABEL, PLURALS } from "@/constants/labels";

export class FileServer extends DefaultServer implements ServerEntity {
  async delete(ctx: MutationCtx, id: string) {
    const file = await ctx.db
      .query(PLURALS[FILE_LABEL])
      .withIndex("by_my_id", (q) => q.eq("id", id))
      .first();
    if (!file) throw new Error("no such file");
    ctx.storage.delete(file.storageId as Id<"_storage">);
    return super.delete(ctx, id, FILE_LABEL);
  }
  async getAll(ctx: QueryCtx) {
    const res = await super.getAll(ctx, FILE_LABEL);
    return res;
  }
}
