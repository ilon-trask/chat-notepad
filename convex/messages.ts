import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

import { PLURALS, MESSAGE_LABEL, CHAT_LABEL } from "../constants/labels";

export const getAll = query({
    handler: async (ctx) => {
        const user = await ctx.auth.getUserIdentity();
        if (!user) throw new Error("User not found");
        const chats = await ctx.db.query("chats").withIndex("by_user", (q) => q.eq("userId", user.subject)).collect();
        const messages = (await Promise.all(
            chats.map(async (chat) => {
                const chatMessages = await ctx.db
                    .query(PLURALS[MESSAGE_LABEL])
                    .withIndex("by_chat", (q) => q.eq("chatId", chat.id))
                    .collect();
                return chatMessages;
            }))).flat();
        return messages;
    },
});

export const getById = query({
    args: { id: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.auth.getUserIdentity();
        if (!user) throw new Error("User not found");
        const message = await ctx.db.query(PLURALS[MESSAGE_LABEL])
            .withIndex("by_my_id", (q) => q.eq("id", args.id))
            .unique()
        if (!message) throw new Error("Message not found");
        return message;
    }
})
export const create = mutation({
    args: { id: v.string(), content: v.string(), chatId: v.string(), createdAt: v.optional(v.number()), editedAt: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const user = await ctx.auth.getUserIdentity();
        if (!user) throw new Error("User not found");
        const chat = await ctx.db
            .query(PLURALS[CHAT_LABEL])
            .withIndex("by_my_id", (q) => q.eq("id", args.chatId))
            .first();
        if (!chat) throw new Error("Chat not found");
        if (chat.userId !== user.subject) throw new Error("You are not the owner of this chat");
        const messageId = await ctx.db.insert(PLURALS[MESSAGE_LABEL], {
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
        const message = await ctx.db.get(args._id);
        if (!message) throw new Error("Message not found");
        const user = await ctx.auth.getUserIdentity();
        if (!user) throw new Error("User not found");
        const chat = await ctx.db
            .query(PLURALS[CHAT_LABEL])
            .withIndex("by_my_id", (q) => q.eq("id", message.chatId))
            .first();
        if (!chat) throw new Error("Chat not found");
        if (chat.userId !== user.subject) throw new Error("You are not the owner of this chat");
        const deleted = await ctx.db.delete(args._id);
        return deleted;
    },
});

export const update = mutation({
    args: { _id: v.id('messages'), content: v.string(), editedAt: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const user = await ctx.auth.getUserIdentity();
        if (!user) throw new Error("User not found");
        const message = await ctx.db.get(args._id);
        if (!message) throw new Error("Message not found");
        const chat = await ctx.db
            .query(PLURALS[CHAT_LABEL])
            .withIndex("by_my_id", (q) => q.eq("id", message.chatId))
            .first();
        if (!chat) throw new Error("Chat not found");
        if (chat.userId !== user.subject) throw new Error("You are not the owner of this chat");

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