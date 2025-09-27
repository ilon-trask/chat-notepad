import {
  CHAT_LABEL,
  FILE_LABEL,
  Labels,
  MESSAGE_LABEL,
} from "@/constants/labels";
import { Adapter, Entity } from "./interface";
import { ChatDB } from "./chat/chatDB";
import { MessageDB } from "./message/messageDB";
import { FileDB } from "./file/fileDB";
import { ChatAdapter } from "./chat/chatAdapter";
import { MessageAdapter } from "./message/messageAdapter";
import { FileAdapter } from "./file/fileAdapter";
import { DATA_LABEL } from "../localDB/createLocalDB";

//TODO: rewrite this with switch
export const entities: Record<Labels, Entity> = {
  //@ts-ignore
  [CHAT_LABEL]: new ChatDB(DATA_LABEL),
  //@ts-ignore
  [MESSAGE_LABEL]: new MessageDB(DATA_LABEL),
  //@ts-ignore
  [FILE_LABEL]: new FileDB(DATA_LABEL),
};

export const enetitiesAdapter: Record<Labels, Adapter> = {
  [CHAT_LABEL]: new ChatAdapter(),
  [MESSAGE_LABEL]: new MessageAdapter(),
  [FILE_LABEL]: new FileAdapter(),
};
