import { WithoutSystemFields } from "convex/server";
import { CHAT_LABEL } from "../../constants/labels";
import { Doc } from "../../convex/_generated/dataModel";

export type ServerChat = WithoutSystemFields<Doc<"chats">>;

export type LocalChat = Omit<
  ServerChat,
  "createdAt" | "editedAt" | "userId"
> & {
  createdAt: Date;
  editedAt: Date;
  type: typeof CHAT_LABEL;
};

export type ChatUpdate = Omit<LocalChat, "createdAt" | "editedAt">;
