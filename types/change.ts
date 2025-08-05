import { Doc } from "@/convex/_generated/dataModel";
import { Data } from "./data/data";
import { CHANGE_LABEL, PLURALS } from "@/constants/labels";
import { WithoutSystemFields } from "convex/server";

export type RemoteChange = WithoutSystemFields<
  Doc<(typeof PLURALS)[typeof CHANGE_LABEL]>
>;

type Change = Omit<RemoteChange, "createdAt" | "editedAt" | "userId">;

type CreateChange = Omit<Change, "type" | "oldData"> & {
  type: "create";
  oldData: undefined;
};
type OtherChange = Omit<Change, "type" | "oldData"> & {
  type: "update" | "delete";
  oldData: Data;
};

export type LocalChange = (CreateChange | OtherChange) & {
  synced: boolean;
  createdAt: Date;
  editedAt: Date;
};

export type ChangeTypes = LocalChange["type"];
