import { LocalDBService } from "./localDBService";
import { DELETE_LABEL } from "@/constants/labels";

export class DeleteService extends LocalDBService<typeof DELETE_LABEL> {
  constructor() {
    super(DELETE_LABEL);
  }
}

export default DeleteService;
