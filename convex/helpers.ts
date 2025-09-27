import { UserIdentity } from "convex/server";

export function userCheck(user: UserIdentity | null) {
  if (!user) throw new Error("Not logged in");
  return user;
}
