import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { CHANGE_LABEL, Labels, PLURALS } from "../constants/labels";
import { changeSchema } from "./schema";

import { ServerData } from "@/types/data/data";
import { entitiesServer } from "./entities/entities";

export const getAll = query({
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error("Not logged in");
    return await ctx.db
      .query(PLURALS[CHANGE_LABEL])
      .withIndex("by_user_id", (q) => q.eq("userId", user.subject))
      .collect();
  },
});

export const getAfter = query({
  args: { index: v.int64() },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error("Not logged in");
    const changes = await ctx.db
      .query(PLURALS[CHANGE_LABEL])
      .withIndex("by_user_id", (q) => q.eq("userId", user.subject))
      .filter((q) => q.gt(q.field("index"), args.index))
      .collect();
    return changes;
  },
});

export const create = mutation({
  args: v.object({ args: changeSchema }),
  handler: async (ctx, { args }) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error("Not logged in");

    async function performChange(table: Labels) {
      const entityServer = new entitiesServer[table](ctx);
      switch (args.type) {
        case "create":
          const created = await entityServer.create(
            args.data as ServerData,
            table
          );
          return created;
          break;
        case "update":
          const upd = await entityServer.update(args.data.id, args.data, table);
          return upd;
          break;
        case "delete":
          const delEntity = await entityServer.delete(args.data.id, table);
          return { id: args.data.id };
          break;
        default:
          break;
      }
    }
    //TODO: get last by index
    const lastChange = await ctx.db
      .query(PLURALS[CHANGE_LABEL])
      .withIndex("by_user_id_index", (q) => q.eq("userId", user.subject))
      .order("desc")
      .first();

    const newChangeId = await ctx.db.insert(PLURALS[CHANGE_LABEL], {
      ...args,
      userId: user.subject,
      index: lastChange ? lastChange.index + BigInt(1) : BigInt(0),
    });

    await performChange(args.table as any);

    const newChange = await ctx.db.get(newChangeId);
    if (!newChange) throw new Error("change wan't created");
    return { success: true, change: newChange } as const;
  },
});
