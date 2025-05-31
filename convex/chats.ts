import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

import { PLURALS, MESSAGE_LABEL, CHAT_LABEL } from "../constants/labels";


export const getAll = query({
    handler: async (ctx) => {
        const user = await ctx.auth.getUserIdentity();
        if (!user) throw new Error("User not found");
        const chats = await ctx.db.query(PLURALS[CHAT_LABEL]).withIndex("by_user", (q) => q.eq("userId", user.subject)).collect();
        return chats;
    },
});

export const getById = query({
    args: { id: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.auth.getUserIdentity();
        if (!user) throw new Error("User not found");
        const chat = await ctx.db.query(PLURALS[CHAT_LABEL])
            .withIndex("by_my_id", (q) => q.eq("id", args.id))
            .unique()
        if (!chat) throw new Error("Chat not found");
        if (chat.userId !== user.subject) throw new Error("You are not the owner of this chat");
        return chat;
    }
})

export const create = mutation({
    args: { id: v.string(), name: v.string(), createdAt: v.optional(v.number()), editedAt: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const user = await ctx.auth.getUserIdentity();
        if (!user) throw new Error("User not found");
        const chatId = await ctx.db.insert(PLURALS[CHAT_LABEL], {
            id: args.id,
            name: args.name,
            createdAt: args.createdAt || Date.now().valueOf(),
            editedAt: args.editedAt || Date.now().valueOf(),
            userId: user.subject,
        });
        const chat = await ctx.db.get(chatId);
        if (!chat) throw new Error("Chat not created");
        return chat;
    },
});

export const deleteEntry = mutation({
    args: { _id: v.id('chats') },
    handler: async (ctx, args) => {
        const user = await ctx.auth.getUserIdentity();
        if (!user) throw new Error("User not found");
        const chat = await ctx.db.get(args._id);
        if (!chat) throw new Error("Chat not found");
        if (chat.userId !== user.subject) throw new Error("You are not the owner of this chat");
        const deleted = await ctx.db.delete(args._id);
        const messages = await ctx.db.query(PLURALS[MESSAGE_LABEL]).withIndex("by_chat", q => q.eq("chatId", chat.id))
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
        const user = await ctx.auth.getUserIdentity();
        if (!user) throw new Error("User not found");
        const chat = await ctx.db.get(args._id);
        if (!chat) throw new Error("Chat not found");
        if (chat.userId !== user.subject) throw new Error("You are not the owner of this chat");
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