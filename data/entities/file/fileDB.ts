import { LocalDBService } from "@/data/localDB/localDBService";
import { LocalFileType } from "@/types/data/file";
import { Entity } from "../interface";
import { DATA_LABEL } from "@/data/localDB/createLocalDB";

export class FileDB
  extends LocalDBService<LocalFileType>
  implements Entity<LocalFileType>
{
  constructor() {
    super(DATA_LABEL);
  }
}
