import { LocalChat } from "@/types/chat.types";
import { Delete } from "@/types/delete.types";
import { LocalFileType } from "@/types/file.types";
import { LocalMessage } from "@/types/message.types";

export const CHAT_LABEL = "chat" as const;
export const MESSAGE_LABEL = "message" as const;
export const DELETE_LABEL = "delete" as const;
export const FILE_LABEL = "file" as const;

export const LABELS = [CHAT_LABEL, MESSAGE_LABEL, FILE_LABEL] as const;
export const SYSTEM_LABELS = [DELETE_LABEL, FILE_LABEL] as const;
export const ALL_LABELS = [...LABELS, ...SYSTEM_LABELS] as const;
export const PLURALS = {
  chat: "chats",
  message: "messages",
  file: "files",
} as const;

export type Labels = (typeof LABELS)[number];
export type AllLabels = (typeof ALL_LABELS)[number];

export type LocalDBServiceMethods = {
  [MESSAGE_LABEL]: {
    return: LocalMessage;
    create: LocalMessage;
    update: LocalMessage;
  };
  [CHAT_LABEL]: {
    return: LocalChat;
    create: LocalChat;
    update: LocalChat;
  };
  [DELETE_LABEL]: {
    return: Delete;
    create: Delete;
    update: Delete;
  };
  [FILE_LABEL]: {
    return: LocalFileType;
    create: LocalFileType;
    update: LocalFileType;
  };
};

export type RemoteDBServiceMethods = {
  [MESSAGE_LABEL]: {
    return: LocalMessage;
    create: LocalMessage;
    update: LocalMessage;
  };
  [CHAT_LABEL]: {
    return: LocalChat;
    create: LocalChat;
    update: LocalChat;
  };
  [FILE_LABEL]: {
    return: LocalFileType;
    create: LocalFileType;
    update: LocalFileType;
  };
};
