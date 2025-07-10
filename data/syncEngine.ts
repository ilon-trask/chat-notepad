import { convex } from "@/components/ConvexClientProvider";
import { api } from "@/convex/_generated/api";
import MessageService from "./messageService";

export default function syncEngine(messageService: MessageService) {
  convex.watchQuery(api.messages.getAll).onUpdate(async () => {
    console.log("message update");
    const serverMessages = await messageService.remoteDBService.getAll();
    const localMessages = await messageService.localDBService.getAll();
    const localMessagesIds = localMessages.map((el) => el.id);
    await Promise.all(
      localMessagesIds.map(async (id) => {
        messageService.localDBService.delete(id);
      })
    );
    console.log("localMessages", localMessages);
    await Promise.all(
      serverMessages.map(async (message) => {
        const localMessage = localMessages.find((el) => el.id === message.id);
        if (localMessage) {
          await messageService.localDBService.update({
            ...message,
            createdAt: new Date(message.createdAt),
            editedAt: new Date(message.editedAt),
            status: "server",
          });
          return;
        }
        await messageService.localDBService.create({
          ...message,
          createdAt: new Date(message.createdAt),
          editedAt: new Date(message.editedAt),
          status: "server",
        });
      })
    );
  });
}
