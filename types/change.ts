import { Doc } from "@/convex/_generated/dataModel";
import { Data } from "./data/data";
import { CHANGE_LABEL, PLURALS } from "@/constants/labels";
import { WithoutSystemFields } from "convex/server";

export type RemoteChange = WithoutSystemFields<
  Doc<(typeof PLURALS)[typeof CHANGE_LABEL]>
>;

type Change = Omit<RemoteChange, "createdAt" | "editedAt" | "userId">;

type CreateChange = Omit<Change, "type" | "oldData" | "data"> & {
  type: "create";
  data: Data;
};

type UpdateChange = Omit<Change, "type" | "oldData" | "data"> & {
  type: "update";
  data: Partial<Data> & { id: Data["id"] };
};

type DeleteChange = Omit<Change, "type" | "oldData" | "data"> & {
  type: "delete";
  data: { id: Data["id"] };
};

export type LocalChange = (CreateChange | UpdateChange | DeleteChange) & {
  synced: boolean;
  createdAt: Date;
  editedAt: Date;
};

export type ChangeTypes = LocalChange["type"];
