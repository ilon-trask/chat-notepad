import { Id } from "@/convex/_generated/dataModel";

export type OfflineMessage = {
  id: string;
  content: string;
  createdAt: Date;
  editedAt: Date;
  chatId: string;
};

export type Message = OfflineMessage & { _id?: Id<"messages">; _creationTime?: number; };

export type MessageUpdate = Omit<Message, "createdAt"> & { createdAt?: Date };
