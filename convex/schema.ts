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
    storageId: v.string(),
    messageId: v.string(),
    createdAt: v.number(),
    editedAt: v.number(),
  })
    .index("by_message", ["messageId"])
    .index("by_my_id", ["id"]),
  changes: defineTable({
    id: v.string(),
    table: v.string(),
    type: v.union(
      v.literal("create"),
      v.literal("update"),
      v.literal("delete")
    ),
    data: v.record(v.string(), v.any()),
    createdAt: v.number(),
    editedAt: v.number(),
    oldData: v.optional(v.record(v.string(), v.any())),
    userId: v.string(),
  })
    .index("by_my_id", ["id"])
    .index("by_user_id", ["userId"]),
});
