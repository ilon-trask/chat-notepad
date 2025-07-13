import { convex } from "@/components/ConvexClientProvider";
import { api } from "@/convex/_generated/api";
import { DataService } from "@/types/dataService.types";
import { DBService } from "./DBService";
import {
  CHAT_LABEL,
  FILE_LABEL,
  Labels,
  LocalDBServiceMethods,
  MESSAGE_LABEL,
} from "@/constants/labels";

export default function syncEngine(
  messageService: DBService<typeof MESSAGE_LABEL>,
  chatService: DBService<typeof CHAT_LABEL>,
  fileService: DBService<typeof FILE_LABEL>
) {
  convex
    .watchQuery(api.messages.getAll)
    .onUpdate(() =>
      sync<typeof MESSAGE_LABEL>(
        messageService.remoteDBService,
        messageService.localDBService
      )
    );
  convex
    .watchQuery(api.chats.getAll)
    .onUpdate(() =>
      sync<typeof CHAT_LABEL>(
        chatService.remoteDBService,
        chatService.localDBService
      )
    );
  convex
    .watchQuery(api.files.getAll)
    .onUpdate(() =>
      sync<typeof FILE_LABEL>(
        fileService.remoteDBService,
        fileService.localDBService
      )
    );
}

async function sync<T extends Labels>(
  remoteDBService: DataService<LocalDBServiceMethods[T]>,
  localDBService: DataService<LocalDBServiceMethods[T]>
) {
  const serverItems = await remoteDBService.getAll();
  const localItems = await localDBService.getAll();
  const localItemsIds = localItems.map((el) => el.id);
  //TODO: handle errors
  await Promise.all(
    localItemsIds.map(async (id) => {
      localDBService.delete(id);
    })
  );
  //TODO: handle errors
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
