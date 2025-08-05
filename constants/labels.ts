import { LocalChat } from "../types/data/chat";
import { LocalFileType } from "../types/data/file";
import { LocalMessage } from "../types/data/message";

export const CHAT_LABEL = "chat" as const;
export const MESSAGE_LABEL = "message" as const;
export const FILE_LABEL = "file" as const;
export const CHANGE_LABEL = "change" as const;

export const LABELS = [CHAT_LABEL, MESSAGE_LABEL, FILE_LABEL] as const;
export const SYSTEM_LABELS = [FILE_LABEL] as const;
export const ALL_LABELS = [...LABELS, ...SYSTEM_LABELS] as const;
export const PLURALS = {
  chat: "chats",
  message: "messages",
  file: "files",
  change: "changes",
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
