import { Doc, Id } from "@/convex/_generated/dataModel";

export type OfflineMessage =
  Omit<Doc<'messages'>, '_id' | '_creationTime' | 'createdAt' | 'editedAt'> & {
    createdAt: Date;
    editedAt: Date;
  };

export type Message = OfflineMessage & { _id?: Id<"messages">; _creationTime?: number; };

export type MessageUpdate = Omit<Message, "createdAt"> & { createdAt?: Date };
