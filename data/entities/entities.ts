import {
  CHAT_LABEL,
  FILE_LABEL,
  Labels,
  MESSAGE_LABEL,
} from "@/constants/labels";
import { Adapter } from "./interface";
import { ChatDB } from "./chat/chatDB";
import { MessageDB } from "./message/messageDB";
import { FileDB } from "./file/fileDB";
import { ChatAdapter } from "./chat/chatAdapter";
import { MessageAdapter } from "./message/messageAdapter";
import { FileAdapter } from "./file/fileAdapter";

export const entities = {
  [CHAT_LABEL]: new ChatDB(),
  [MESSAGE_LABEL]: new MessageDB(),
  [FILE_LABEL]: new FileDB(),
};

export const enetitiesAdapter: Record<Labels, Adapter> = {
  [CHAT_LABEL]: new ChatAdapter(),
  [MESSAGE_LABEL]: new MessageAdapter(),
  [FILE_LABEL]: new FileAdapter(),
};
