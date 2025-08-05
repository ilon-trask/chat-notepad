import { LocalChat } from "./chat";
import { LocalFileType } from "./file";
import { LocalMessage } from "./message";

export type Data = LocalChat | LocalMessage | LocalFileType;
