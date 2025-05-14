import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    messages: defineTable({
        id: v.string(),
        content: v.string(),
        createdAt: v.number(),
        editedAt: v.number(),
        chatId: v.string(),
    }).index("by_chat", ["chatId"])
        .index("by_my_id", ["id"]),
    chats: defineTable({
        id: v.string(),
        name: v.string(),
        createdAt: v.number(),
        editedAt: v.number(),
        userId: v.string(),
    }).index("by_user", ["userId"])
        .index("by_my_id", ["id"]),
});