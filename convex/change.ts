import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { CHANGE_LABEL, PLURALS } from "../constants/labels";
import { changeSchema } from "./schema";
import { cronJobs } from "convex/server";

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
  args: { after: v.number() },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error("Not logged in");
    const changes = await ctx.db
      .query(PLURALS[CHANGE_LABEL])
      .withIndex("by_user_id", (q) => q.eq("userId", user.subject))
      .filter((q) => q.gt(q.field("createdAt"), args.after))
      .collect();
    return changes;
  },
});

export const create = mutation({
  args: v.object({ args: changeSchema }),
  handler: async (ctx, { args }) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error("Not logged in");
    async function performChange(table: "chat" | "message" | "file") {
      switch (args.type) {
        case "create":
          await ctx.db.insert(PLURALS[table], {
            ...args.data,

            //@ts-ignore
            userId: table == "chat" ? user?.subject! : undefined,
          });
          const created = await ctx.db
            .query(PLURALS[table])
            .withIndex("by_my_id", (q) => q.eq("id", args.data.id))
            .first();
          return created;
          break;
        case "update":
          const entity = await ctx.db
            .query(PLURALS[table])
            .withIndex("by_my_id", (q) => q.eq("id", args.data.id))
            .first();
          if (!entity) throw new Error("no such entity");
          await ctx.db.patch(entity._id, {
            ...args.data,
          });
          const upd = await ctx.db
            .query(PLURALS[table])
            .withIndex("by_my_id", (q) => q.eq("id", args.data.id))
            .first();
          return upd;
          break;
        case "delete":
          const delEntity = await ctx.db
            .query(PLURALS[table])
            .withIndex("by_my_id", (q) => q.eq("id", args.data.id))
            .first();
          if (!delEntity) throw new Error("no such entity");
          await ctx.db.delete(delEntity._id);
          return { id: delEntity.id };
          break;
        default:
          break;
      }
    }

    const lastChange = await ctx.db
      .query(PLURALS[CHANGE_LABEL])
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), user.subject),
          q.eq(q.field("table"), args.table)
        )
      )
      .first();

    if (lastChange) {
      if (lastChange.createdAt > args.createdAt)
        throw new Error("older change was applied");
    }
    const newChangeId = await ctx.db.insert(PLURALS[CHANGE_LABEL], {
      ...args,
      userId: user.subject,
    });
    const data = await performChange(args.table as any);
    const change = args;
    change.data = data as any;
    const newChange = await ctx.db.get(newChangeId);
    if (!newChange) throw new Error("change wan't created");
    return { success: true, change: newChange } as const;
  },
});


const crons = cronJobs()

// crons.daily('delete old changes',)