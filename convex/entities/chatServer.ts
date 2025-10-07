import { DefaultServer } from "./deafultServer";
import { CHAT_LABEL, PLURALS } from "@/constants/labels";
import { MESSAGE_LABEL } from "@/constants/labels";
import { MessageServer } from "./messageServer";
import { MutationCtx, QueryCtx } from "@/convex/_generated/server";
import { ServerEntity } from "./interface";

export class ChatServer extends DefaultServer implements ServerEntity {
  private messageServer: MessageServer;

  constructor() {
    super();
    this.messageServer = new MessageServer();
  }

  async delete(ctx: MutationCtx, id: string) {
    const messages = await ctx.db
      .query(PLURALS[MESSAGE_LABEL])
      .filter((q) => q.eq(q.field("chatId"), id))
      .collect();

    await Promise.all(
      messages.map((msg) =>
        this.messageServer.delete(ctx, msg.id, MESSAGE_LABEL)
      )
    );

    return super.delete(ctx, id, CHAT_LABEL);
  }
  async getAll(ctx: QueryCtx) {
    const res = await super.getAll(ctx, CHAT_LABEL);
    return res;
  }
}
