import { WithoutSystemFields } from "convex/server";
import { FILE_LABEL } from "../../constants/labels";
import { Doc } from "../../convex/_generated/dataModel";

export type RemoteFileType = WithoutSystemFields<Doc<"files">>;

export type LocalFileType = Omit<
  RemoteFileType,
  "storageId" | "editedAt" | "createdAt"
> & {
  file: Blob;
  editedAt: Date;
  createdAt: Date;
  status: "pending" | "server";
  type: typeof FILE_LABEL;
  //TODO: propper type for file
  storageId?: string;
};
