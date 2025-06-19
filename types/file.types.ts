export type FileType = {
  id: string;
  name: string;
  file: File;
  messageId: string;
  createdAt: Date;
  editedAt: Date;
} & { storageId?: string; _id?: string };
