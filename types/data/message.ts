import { WithoutSystemFields } from "convex/server";
import { MESSAGE_LABEL } from "../../constants/labels";
import { Doc } from "../../convex/_generated/dataModel";

export type ServerMessage = WithoutSystemFields<Doc<"messages">>;

export type LocalMessage = Omit<ServerMessage, "createdAt" | "editedAt"> & {
  createdAt: Date;
  editedAt: Date;
  type: typeof MESSAGE_LABEL;
};

export type MessageUpdate = Omit<LocalMessage, "createdAt"> & {
  createdAt?: Date;
};
