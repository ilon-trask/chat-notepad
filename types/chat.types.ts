import { Doc } from "@/convex/_generated/dataModel";

export type OfflineChat = Omit<
  Doc<"chats">,
  "_id" | "_creationTime" | "createdAt" | "editedAt" | "userId"
> & {
  createdAt: Date;
  editedAt: Date;
  status: "pending" | "server";
};

export type ChatUpdate = Omit<OfflineChat, "createdAt" | "editedAt">;
