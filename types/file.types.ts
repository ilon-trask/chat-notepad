export type FileType = {
  id: string;
  name: string;
  file: File;
  messageId: string;
  createdAt: Date;
  editedAt: Date;
} & (
  | { isPreview: false; storageId?: string; _id?: string }
  | { isPreview: true }
);
