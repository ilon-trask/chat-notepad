import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    messages: defineTable({
        id: v.string(),
        content: v.string(),
        createdAt: v.number(),
        editedAt: v.number(),
        chatId: v.string(),
    }).index("by_chat", ["chatId"]),
    chats: defineTable({
        id: v.string(),
        name: v.string(),
        createdAt: v.number(),
        editedAt: v.number(),
        // users: v.array(v.id("users")),
    }),
    //   users: defineTable({
    //     name: v.string(),
    //     tokenIdentifier: v.string(),
    //   }).index("by_token", ["tokenIdentifier"]),
});