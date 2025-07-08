import { Doc } from "@/convex/_generated/dataModel";

export type RemoteFileType = Doc<"files">;

export type LocalFileType = Omit<
  RemoteFileType,
  "_id" | "storageId" | "_creationTime" | "editedAt" | "createdAt" | "storageId"
> & {
  file: Blob;
  editedAt: Date;
  createdAt: Date;
  status: "pending" | "server";
};
