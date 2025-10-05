import { DefaultServer } from "./deafultServer";
import { Id } from "@/convex/_generated/dataModel";
import { CHAT_LABEL, PLURALS } from "@/constants/labels";
import { Labels, MESSAGE_LABEL } from "@/constants/labels";
import { MessageServer } from "./messageServer";
import { MutationCtx } from "@/convex/_generated/server";
import { userCheck } from "@/convex/helpers";
import { ServerChat } from "@/types/data/chat";
import { ServerEntity } from "./interface";
import { ServerData } from "@/types/data/data";

export class ChatServer extends DefaultServer implements ServerEntity {
  private messageServer: MessageServer;
  ctx: MutationCtx;
  constructor(ctx: MutationCtx) {
    super(ctx);
    this.messageServer = new MessageServer(ctx);
    this.ctx = ctx;
  }

  async delete(id: string) {
    const messages = await this.ctx.db
      .query(PLURALS[MESSAGE_LABEL])
      .filter((q) => q.eq(q.field("chatId"), id))
      .collect();

    await Promise.all(
      messages.map((msg) => this.messageServer.delete(msg.id, MESSAGE_LABEL))
    );

    return super.delete(id, CHAT_LABEL);
  }
  async getAll() {
    const res = await super.getAll(CHAT_LABEL);
    return res;
  }
}
