import { WithoutSystemFields } from "convex/server";
import { FILE_LABEL } from "../../constants/labels";
import { Doc } from "../../convex/_generated/dataModel";

export type ServerFile = WithoutSystemFields<Doc<"files">>;

export type LocalFileType = Omit<
  ServerFile,
  "storageId" | "editedAt" | "createdAt" | "userId"
> & {
  file: Blob;
  editedAt: Date;
  createdAt: Date;
  type: typeof FILE_LABEL;
  storageId?: string;
};
