import { Data, ServerData } from "@/types/data/data";
import { Adapter } from "../interface";

export class DefaultAdapter implements Adapter {
  async toServer(data: Partial<Data>) {
    const { type, ...rest } = data;
    const res = {
      ...rest,
      createdAt: rest.createdAt ? rest.createdAt?.valueOf() : undefined,
      editedAt: rest.editedAt ? rest.editedAt?.valueOf() : undefined,
    } as Partial<ServerData>;
    if (!res.createdAt) delete res.createdAt;
    if (!res.editedAt) delete res.editedAt;
    return res;
  }
  async toClient(data: Partial<ServerData>) {
    const { ...rest } = data;
    const res = {
      ...rest,
      createdAt: rest.createdAt ? new Date(rest.createdAt) : undefined,
      editedAt: rest.editedAt ? new Date(rest.editedAt) : undefined,
    } as Partial<Data>;
    if (!res.createdAt) delete res.createdAt;
    if (!res.editedAt) delete res.editedAt;
    return res;
  }
}
