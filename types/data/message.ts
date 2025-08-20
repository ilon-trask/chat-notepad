import { WithoutSystemFields } from "convex/server";
import { MESSAGE_LABEL } from "../../constants/labels";
import { Doc } from "../../convex/_generated/dataModel";

export type LocalMessage = Omit<
  WithoutSystemFields<Doc<"messages">>,
  "createdAt" | "editedAt"
> & {
  createdAt: Date;
  editedAt: Date;
  status: "pending" | "server";
  type: typeof MESSAGE_LABEL;
};

export type MessageUpdate = Omit<LocalMessage, "createdAt"> & {
  createdAt?: Date;
};
