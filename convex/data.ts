import { query } from "./_generated/server";
import { userCheck } from "./helpers";

const getAll = query({
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity();
    userCheck(user);
  },
});
