import { ServerData } from "@/types/data/data";
import { ServerEntity } from "./interface";
import { MutationCtx, QueryCtx } from "@/convex/_generated/server";
import { Labels, PLURALS } from "@/constants/labels";

export class DefaultServer implements ServerEntity {
  create(ctx: MutationCtx, data: ServerData, table: Labels) {
    return ctx.db.insert(PLURALS[table], data);
  }
  async getAll(ctx: QueryCtx, table: Labels) {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error("Not logged in");
    return ctx.db
      .query(PLURALS[table])
      .withIndex("by_user_id", (q) => q.eq("userId", user.subject))
      .collect();
  }
  async delete(ctx: MutationCtx, id: string, table: Labels) {
    const entity = await ctx.db
      .query(PLURALS[table])
      .withIndex("by_my_id", (q) => q.eq("id", id))
      .first();
    if (!entity) throw new Error("no such entity");
    return ctx.db.delete(entity._id);
  }
  getOne(ctx: QueryCtx, id: string, table: Labels) {
    return ctx.db
      .query(PLURALS[table])
      .withIndex("by_my_id", (q) => q.eq("id", id))
      .first();
  }
  async update(
    ctx: MutationCtx,
    id: string,
    data: Partial<ServerData>,
    table: Labels
  ) {
    const entity = await ctx.db
      .query(PLURALS[table])
      .withIndex("by_my_id", (q) => q.eq("id", id))
      .first();
    if (!entity) throw new Error("no such entity");
    await ctx.db.patch(entity._id, data);
    return ctx.db.get(entity._id);
  }
}
