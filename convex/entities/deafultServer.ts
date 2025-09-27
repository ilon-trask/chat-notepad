import { ServerData } from "@/types/data/data";
import { ServerEntity } from "./interface";
import { MutationCtx } from "@/convex/_generated/server";
import { Labels, PLURALS } from "@/constants/labels";

export class DefaultServer implements ServerEntity {
  ctx: MutationCtx;
  constructor(ctx: MutationCtx) {
    this.ctx = ctx;
  }
  create(data: ServerData, table: Labels) {
    return this.ctx.db.insert(PLURALS[table], data);
  }
  async delete(id: string, table: Labels) {
    const entity = await this.ctx.db
      .query(PLURALS[table])
      .withIndex("by_my_id", (q) => q.eq("id", id))
      .first();
    if (!entity) throw new Error("no such entity");
    return this.ctx.db.delete(entity._id);
  }
  getOne(id: string, table: Labels) {
    return this.ctx.db
      .query(PLURALS[table])
      .withIndex("by_my_id", (q) => q.eq("id", id))
      .first();
  }
  async update(id: string, data: Partial<ServerData>, table: Labels) {
    const entity = await this.ctx.db
      .query(PLURALS[table])
      .withIndex("by_my_id", (q) => q.eq("id", id))
      .first();
    if (!entity) throw new Error("no such entity");
    await this.ctx.db.patch(entity._id, data);
    return this.ctx.db.get(entity._id);
  }
}
