import { Doc } from "@/convex/_generated/dataModel";

export type RemoteFileType = Doc<"files">;

export type LocalFileType = Omit<
  RemoteFileType,
  "_id" | "storageId" | "_creationTime" | "editedAt" | "createdAt"
> & {
  file: Blob;
  editedAt: Date;
  createdAt: Date;
  status: "pending" | "server";
  //TODO: propper type for file
  storageId?: string;
};
