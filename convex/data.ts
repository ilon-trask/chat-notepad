import { LABELS } from "@/constants/labels";
import { query } from "./_generated/server";
import { userCheck } from "./helpers";
import { DefaultServer } from "./entities/deafultServer";

export const getAll = query({
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity();
    userCheck(user);
    //@ts-ignore
    const defaultServer = new DefaultServer(ctx);
    const data = (
      await Promise.all(
        LABELS.map(async (label) => {
          const data = await defaultServer.getAll(label);
          return data.map((el) => ({ ...el, type: label }));
        })
      )
    ).flat();
    return data;
  },
});
