import { CHAT_LABEL, Labels } from "@/constants/labels";
import { ServerEntity } from "./interface";
import { MutationCtx } from "../_generated/server";
import { ChatServer } from "./chatServer";
import { MESSAGE_LABEL } from "@/constants/labels";
import { FILE_LABEL } from "@/constants/labels";
import { MessageServer } from "./messageServer";
import { FileServer } from "./fileServer";

type ServerConstructorMap = {
  [K in Labels]: ServerEntity<K>;
};
export const entitiesServer: ServerConstructorMap = {
  [CHAT_LABEL]: new ChatServer() as ServerEntity<typeof CHAT_LABEL>,
  [MESSAGE_LABEL]: new MessageServer() as ServerEntity<typeof MESSAGE_LABEL>,
  [FILE_LABEL]: new FileServer() as ServerEntity<typeof FILE_LABEL>,
};
