import { CHAT_LABEL, Labels } from "@/constants/labels";
import { ServerEntity } from "./interface";
import { MutationCtx } from "../_generated/server";
import { ChatServer } from "./chatServer";
import { MESSAGE_LABEL } from "@/constants/labels";
import { FILE_LABEL } from "@/constants/labels";
import { MessageServer } from "./messageServer";
import { FileServer } from "./fileServer";

type ServerConstructorMap = {
    [K in Labels]: new (ctx: MutationCtx) => ServerEntity<K>;
};
export const entitiesServer: ServerConstructorMap = {
    [CHAT_LABEL]: ChatServer as new (ctx: MutationCtx) => ServerEntity,
    [MESSAGE_LABEL]: MessageServer as new (
        ctx: MutationCtx
    ) => ServerEntity<typeof MESSAGE_LABEL>,
    [FILE_LABEL]: FileServer as new (
        ctx: MutationCtx
    ) => ServerEntity<typeof FILE_LABEL>,
};


