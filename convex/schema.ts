import { defineSchema, defineTable } from "convex/server";
import { v, VFloat64, VString } from "convex/values";

type MandatoryFields = {
  id: VString<string, "required">;
  createdAt: VFloat64<number, "required">;
  editedAt: VFloat64<number, "required">;
};

export const MANDATORY_FIELDS = {
  id: v.string(),
  createdAt: v.number(),
  editedAt: v.number(),
};

function addMandatoryFields<T>(schema: T): T & MandatoryFields {
  return {
    ...schema,
    ...MANDATORY_FIELDS,
  };
}

export const messagesSchema = addMandatoryFields({
  content: v.string(),
  chatId: v.string(),
});

export const chatsSchema = addMandatoryFields({
  name: v.string(),
});

export const filesSchema = addMandatoryFields({
  name: v.string(),
  storageId: v.string(),
  messageId: v.string(),
});

export const dataSchema = v.union(
  v.object(messagesSchema),
  v.object(chatsSchema),
  v.object(filesSchema)
);

const changeObj = addMandatoryFields({
  table: v.string(),
});

const createChangeSchema = <T>(obj: T) => {
  return v.union(
    v.object({
      ...obj,
      type: v.literal("create"),
      data: dataSchema,
    }),
    v.object({
      ...obj,
      type: v.literal("update"),
      data: dataSchema,
      oldData: dataSchema,
    }),
    v.object({
      ...obj,
      type: v.literal("delete"),
      data: v.object({ id: v.string() }),
      oldData: dataSchema,
    })
  );
};

export const changeSchema = createChangeSchema(changeObj);

export default defineSchema({
  messages: defineTable(messagesSchema)
    .index("by_chat", ["chatId"])
    .index("by_my_id", ["id"]),
  chats: defineTable({ ...chatsSchema, userId: v.string() })
    .index("by_user", ["userId"])
    .index("by_my_id", ["id"]),
  files: defineTable(filesSchema)
    .index("by_message", ["messageId"])
    .index("by_my_id", ["id"]),
  changes: defineTable(createChangeSchema({ ...changeObj, userId: v.string() }))
    .index("by_my_id", ["id"])
    .index("by_user_id", ["userId"]),
});
