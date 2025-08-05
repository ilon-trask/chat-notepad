import { MESSAGE_LABEL } from "../../constants/labels";
import { Doc } from "../../convex/_generated/dataModel";

export type LocalMessage = Omit<
  Doc<"messages">,
  "_id" | "_creationTime" | "createdAt" | "editedAt"
> & {
  createdAt: Date;
  editedAt: Date;
  status: "pending" | "server";
  type: typeof MESSAGE_LABEL;
};

export type MessageUpdate = Omit<LocalMessage, "createdAt"> & {
  createdAt?: Date;
};
