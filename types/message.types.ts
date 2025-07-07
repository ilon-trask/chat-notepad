import { Doc, Id } from "@/convex/_generated/dataModel";

export type OfflineMessage = Omit<
  Doc<"messages">,
  "_id" | "_creationTime" | "createdAt" | "editedAt"
> & {
  createdAt: Date;
  editedAt: Date;
  status: "pending" | "server";
};

export type MessageUpdate = Omit<OfflineMessage, "createdAt"> & {
  createdAt?: Date;
};
