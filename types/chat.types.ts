import { Id } from "@/convex/_generated/dataModel";

export type OfflineChat = {
  id: string;
  name: string;
  createdAt: Date;
  editedAt: Date;
};

export type Chat = OfflineChat & { _id?: Id<"chats">; _creationTime?: number; };

export type ChatUpdate = Omit<Chat, "createdAt"> & {
  createdAt?: Chat["createdAt"];
};
