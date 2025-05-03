import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
    handler: async (ctx) => {
        const messages = await ctx.db.query("messages").collect();
        return messages;
    },
});

export const create = mutation({
    args: { id: v.string(), content: v.string(), chatId: v.string(), createdAt: v.optional(v.number()), editedAt: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const messageId = await ctx.db.insert("messages", {
            id: args.id,
            content: args.content,
            chatId: args.chatId,
            createdAt: args.createdAt || Date.now(),
            editedAt: args.editedAt || Date.now(),
        });
        const message = await ctx.db.get(messageId);
        if (!message) throw new Error("Message not created");
        return message;
    },
});

export const deleteEntry = mutation({
    args: { _id: v.id('messages') },
    handler: async (ctx, args) => {
        const deleted = await ctx.db.delete(args._id);
        return deleted;
    },
});

export const update = mutation({
    args: { _id: v.id('messages'), content: v.string(), editedAt: v.optional(v.number()) },
    handler: async (ctx, args) => {
        await ctx.db.patch(args._id,
            {
                content: args.content,
                editedAt: args.editedAt || Date.now(),
            });
        const newMessage = await ctx.db.get(args._id);
        if (!newMessage) throw new Error("Message not found"); // TODO: remove this li
        return newMessage;
    },
});