import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  messages: defineTable({
    id: v.string(),
    content: v.string(),
    createdAt: v.number(),
    editedAt: v.number(),
    chatId: v.string(),
  })
    .index("by_chat", ["chatId"])
    .index("by_my_id", ["id"]),
  chats: defineTable({
    id: v.string(),
    name: v.string(),
    createdAt: v.number(),
    editedAt: v.number(),
    userId: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_my_id", ["id"]),
  files: defineTable({
    id: v.string(),
    name: v.string(),
    isPreview: v.boolean(),
    storageId: v.string(),
    messageId: v.string(),
    createdAt: v.number(),
    editedAt: v.number(),
  })
    .index("by_message", ["messageId"])
    .index("by_my_id", ["id"]),
});
