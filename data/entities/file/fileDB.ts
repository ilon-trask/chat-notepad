import { LocalDBService } from "@/data/localDB/localDBService";
import { LocalFileType } from "@/types/data/file";
import { Entity } from "../interface";

//@ts-ignore
export class FileDB extends LocalDBService<LocalFileType> implements Entity {}
