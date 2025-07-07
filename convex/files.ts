import { mutation, query } from "./_generated/server";
import {
  PLURALS,
  FILE_LABEL,
  CHAT_LABEL,
  MESSAGE_LABEL,
} from "../constants/labels";
import { v } from "convex/values";

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const getAll = query({
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error("User not found");
    const chats = await ctx.db
      .query("chats")
      .withIndex("by_user", (q) => q.eq("userId", user.subject))
      .collect();
    if (!chats) throw new Error("Chats not found");

    const messages = (
      await Promise.all(
        chats.map(async (chat) => {
          const chatMessages = await ctx.db
            .query(PLURALS[MESSAGE_LABEL])
            .withIndex("by_chat", (q) => q.eq("chatId", chat.id))
            .collect();
          return chatMessages;
        })
      )
    ).flat();
    const files = await Promise.all(
      messages.map(async (message) => {
        const messageFiles = await ctx.db
          .query(PLURALS[FILE_LABEL])
          .withIndex("by_message", (q) => q.eq("messageId", message.id))
          .collect();
        return messageFiles;
      })
    );
    return files.flat();
  },
});

export const getById = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error("User not found");
    const file = await ctx.db
      .query(PLURALS[FILE_LABEL])
      .withIndex("by_my_id", (q) => q.eq("id", args.id))
      .unique();
    if (!file) throw new Error("File not found");
    return file;
  },
});

export const create = mutation({
  args: {
    id: v.string(),
    name: v.string(),
    messageId: v.string(),
    storageId: v.string(),
    createdAt: v.optional(v.number()),
    editedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error("User not found");
    const message = await ctx.db
      .query(PLURALS[MESSAGE_LABEL])
      .withIndex("by_my_id", (q) => q.eq("id", args.messageId))
      .first();
    if (!message) throw new Error("Message not found");
    const chat = await ctx.db
      .query(PLURALS[CHAT_LABEL])
      .withIndex("by_my_id", (q) => q.eq("id", message.chatId))
      .first();
    if (!chat) throw new Error("Chat not found");
    if (chat.userId !== user.subject)
      throw new Error("You are not the owner of this chat");
    const fileId = await ctx.db.insert(PLURALS[FILE_LABEL], {
      ...args,
      createdAt: args.createdAt || Date.now(),
      editedAt: args.editedAt || Date.now(),
    });
    const file = await ctx.db.get(fileId);
    if (!file) throw new Error("File not created");
    return file;
  },
});

export const deleteEntry = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const file = await ctx.db
      .query("files")
      .withIndex("by_my_id", (q) => q.eq("id", args.id))
      .first();
    if (!file) throw new Error("File not found");
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error("User not found");
    await ctx.storage.delete(file.storageId);
    const deleted = await ctx.db.delete(file._id);
    return deleted;
  },
});

export const update = mutation({
  args: {
    id: v.string(),
    name: v.optional(v.string()),
    editedAt: v.optional(v.number()),
    storageId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error("User not found");
    const file = await ctx.db
      .query("files")
      .withIndex("by_my_id", (q) => q.eq("id", args.id))
      .first();
    if (!file) throw new Error("File not found");
    await ctx.storage.delete(file.storageId);
    await ctx.db.patch(file._id, {
      ...args,
    });
    const newFile = await ctx.db.get(file._id);
    if (!newFile) throw new Error("File not found");
    return newFile;
  },
});
