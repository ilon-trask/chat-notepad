import { LocalChat, ServerChat } from "./chat";
import { LocalFileType, ServerFile } from "./file";
import { LocalMessage, ServerMessage } from "./message";

export type Data = LocalChat | LocalMessage | LocalFileType;
export type ServerData = ServerChat | ServerMessage | ServerFile;
