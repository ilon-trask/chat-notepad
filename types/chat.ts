export type Chat = {
  id: string;
  name: string;
  createdAt: Date;
};

export type ChatUpdate = Omit<Chat, "createdAt"> & {
  createdAt?: Chat["createdAt"];
};
