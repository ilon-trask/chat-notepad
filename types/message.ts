export type Message = {
  id: string;
  content: string;
  createdAt: Date;
  editedAt: Date;
  chatId: string;
};

export type MessageUpdate = Omit<Message, "createdAt"> & { createdAt?: Date };
