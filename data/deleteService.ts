import { Delete } from "@/types/delete.types";
import { LocalDBService } from "./localDBService";
import { DELETE_LABEL } from "@/constants/labels";

class DeleteService {
    private _localDBservice: LocalDBService;

    constructor(localDBService: LocalDBService) {
        this._localDBservice = localDBService;
    }

    async getAllDelete(): Promise<Delete[]> {
        return await this._localDBservice.getAll<typeof DELETE_LABEL>(DELETE_LABEL);
    }
    async createDelete(data: Delete) {
        return await this._localDBservice.create<typeof DELETE_LABEL>(DELETE_LABEL, data);
    }
    async updateDelete(data: Delete) {
        return await this._localDBservice.update<typeof DELETE_LABEL>(DELETE_LABEL, data);
    }
    async deleteDelete(id: string) {
        return await this._localDBservice.delete(DELETE_LABEL, id);
    }
}

export default DeleteService;