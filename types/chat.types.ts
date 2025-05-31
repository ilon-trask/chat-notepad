import { Doc, Id } from "@/convex/_generated/dataModel";

export type OfflineChat =
  Omit<Doc<'chats'>, "_id" | "_creationTime" | 'createdAt' | 'editedAt' | 'userId'> & {
    createdAt: Date;
    editedAt: Date;
  }
export type Chat = OfflineChat & { _id?: Id<"chats">; _creationTime?: number; };

export type ChatUpdate = Omit<Chat, "createdAt"> & {
  createdAt?: Chat["createdAt"];
};
