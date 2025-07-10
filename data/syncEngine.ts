import { convex } from "@/components/ConvexClientProvider";
import { api } from "@/convex/_generated/api";
import MessageService from "./messageService";
import { DataService } from "@/types/dataService.types";
import ChatService from "./chatService";
import FileService from "./fileService";

export default function syncEngine(
  messageService: MessageService,
  chatService: ChatService,
  fileService: FileService
) {
  //TODO: when delete message, delete all files
  convex
    .watchQuery(api.messages.getAll)
    .onUpdate(() =>
      sync(messageService.remoteDBService, messageService.localDBService)
    );
  //TODO: when delete chat, delete all messages
  convex
    .watchQuery(api.chats.getAll)
    .onUpdate(() =>
      sync(chatService.remoteDBService, chatService.localDBService)
    );
    convex
    .watchQuery(api.files.getAll)
    .onUpdate(() =>
      sync(fileService.remoteDBService, fileService.localDBService)
    );
}

async function sync(remoteDBService: DataService, localDBService: DataService) {
  const serverItems = await remoteDBService.getAll();
  const localItems = await localDBService.getAll();
  const localItemsIds = localItems.map((el) => el.id);
  await Promise.all(
    localItemsIds.map(async (id) => {
      localDBService.delete(id);
    })
  );
  await Promise.all(
    serverItems.map(async (item) => {
      if (localItemsIds.includes(item.id)) {
        await localDBService.update(item);
        return;
      }
      await localDBService.create(item);
    })
  );
}
