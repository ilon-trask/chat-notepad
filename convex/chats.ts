import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
    handler: async (ctx) => {
        const chats = await ctx.db.query("chats").collect();
        return chats;
    },
});

export const create = mutation({
    args: { id: v.string(), name: v.string(), createdAt: v.optional(v.number()), editedAt: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const chatId = await ctx.db.insert("chats", {
            id: args.id,
            name: args.name,
            createdAt: args.createdAt || Date.now().valueOf(),
            editedAt: args.editedAt || Date.now().valueOf(),
        });
        const chat = await ctx.db.get(chatId);
        if (!chat) throw new Error("Chat not created");
        return chat;
    },
});

export const deleteEntry = mutation({
    args: { _id: v.id('chats') },
    handler: async (ctx, args) => {
        const chat = await ctx.db.get(args._id);
        if (!chat) throw new Error("Chat not found");
        const deleted = await ctx.db.delete(args._id);
        const messages = await ctx.db.query("messages").withIndex("by_chat", q => q.eq("chatId", chat.id))
            .collect();
        for (const message of messages) {
            await ctx.db.delete(message._id);
        }
        return deleted;
    },
});

export const update = mutation({
    args: { _id: v.id('chats'), name: v.string(), editedAt: v.optional(v.number()) },
    handler: async (ctx, args) => {
        await ctx.db.patch(args._id,
            {
                name: args.name,
                editedAt: args.editedAt || Date.now().valueOf()
            });
        const newChat = await ctx.db.get(args._id);
        if (!newChat) throw new Error("Chat not found");
        return newChat;
    },
});