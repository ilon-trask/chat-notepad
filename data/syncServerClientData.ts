import { CHAT_LABEL, FILE_LABEL, MESSAGE_LABEL } from "@/constants/labels";
import ChatService from "./chatService";
import MessageService from "./messageService";
import FileService from "./fileService";
import { DeleteService } from "./deleteService";
import { DataService } from "@/types/dataService.types";

export default async function syncServerClientData({
  chatService,
  deleteService,
  fileService,
  messageService,
}: {
  chatService: ChatService;
  messageService: MessageService;
  fileService: FileService;
  deleteService: DeleteService;
}) {
  const deletes = await deleteService.getAll();

  for (const deleteItem of deletes) {
    if (deleteItem.type === CHAT_LABEL) {
      await chatService.remoteDBService.delete(deleteItem.entityId);
      deleteService.delete(deleteItem.id);
    } else if (deleteItem.type === MESSAGE_LABEL) {
      await messageService.remoteDBService.delete(deleteItem.entityId);
      await fileService.deleteMessageFiles(deleteItem.entityId);
      deleteService.delete(deleteItem.id);
    } else if (deleteItem.type === FILE_LABEL) {
      await fileService.remoteDBService.delete(deleteItem.entityId);
      deleteService.delete(deleteItem.id);
    }
  }

  await syncTable(chatService.remoteDBService, chatService.localDBService);
  await syncTable(
    messageService.remoteDBService,
    messageService.localDBService
  );
  const serverEntries = await fileService.remoteDBService.getAll();
  const clientEntries = await fileService.localDBService.getAll();
  const serverEntriesIds = serverEntries.map((el) => el.id);
  const clientEntriesIds = clientEntries.map((el) => el.id);

  const entiesIdSet = new Set([...serverEntriesIds, ...clientEntriesIds]);

  for (const entryId of entiesIdSet) {
    if (!clientEntriesIds.includes(entryId)) {
      const newChat = serverEntries.find((el) => el.id === entryId);
      if (!newChat) throw new Error("Chat not found");
      const blob = await fileService.serveFile(newChat.storageId);
      await fileService.localDBService.create({
        id: newChat.id,
        name: newChat.name,
        messageId: newChat.messageId,
        createdAt: new Date(newChat.createdAt),
        editedAt: new Date(newChat.editedAt),
        status: "server",
        file: blob,
      });
    } else if (!serverEntriesIds.includes(entryId)) {
      const newChat = clientEntries.find((el) => el.id === entryId);
      if (!newChat) throw new Error("Chat not found");
      const newServerChat = await fileService.createFile({
        id: newChat.id,
        name: newChat.name,
        messageId: newChat.messageId,
        editedAt: newChat.editedAt,
        createdAt: newChat.createdAt,
        file: newChat.file,
        status: "pending",
      });
      await fileService.localDBService.update({
        ...newServerChat,
        createdAt: new Date(newServerChat.createdAt),
        editedAt: new Date(newServerChat.editedAt),
        status: "server",
      });
    }
  }
}

async function syncTable(
  remoteDBService: DataService,
  localDBService: DataService
) {
  const serverEntries = await remoteDBService.getAll();
  const clientEntries = await localDBService.getAll();
  const serverEntriesIds = serverEntries.map((el) => el.id);
  const clientEntriesIds = clientEntries.map((el) => el.id);

  const entiesIdSet = new Set([...serverEntriesIds, ...clientEntriesIds]);

  for (const entryId of entiesIdSet) {
    if (!clientEntriesIds.includes(entryId)) {
      const newChat = serverEntries.find((el) => el.id === entryId);
      if (!newChat) throw new Error("Chat not found");
      await localDBService.create({
        ...newChat,
        createdAt: new Date(newChat.createdAt),
        editedAt: new Date(newChat.editedAt),
        status: "server",
      });
    } else if (!serverEntriesIds.includes(entryId)) {
      const newChat = clientEntries.find((el) => el.id === entryId);
      if (!newChat) throw new Error("Chat not found");
      const newServerChat = await remoteDBService.create({
        id: newChat.id,
        name: newChat.name,
        createdAt: newChat.createdAt.valueOf(),
      });
      await localDBService.update({
        ...newServerChat,
        createdAt: new Date(newServerChat.createdAt),
        editedAt: new Date(newServerChat.editedAt),
        status: "server",
      });
    } else {
      const isEqualContent =
        JSON.stringify(clientEntries.find((el) => el.id === entryId)) ==
        JSON.stringify(serverEntries.find((el) => el.id === entryId));
      if (!isEqualContent) {
        const serverChat = serverEntries.find((el) => el.id === entryId);
        const clientChat = clientEntries.find((el) => el.id === entryId);
        if (!serverChat || !clientChat) throw new Error("Chat not found");
        if (serverChat.editedAt.valueOf() > clientChat.editedAt.valueOf()) {
          const newServerChat = await remoteDBService.update({
            id: clientChat.id,
            name: clientChat.name,
            editedAt: serverChat.editedAt.valueOf(),
          });
          await localDBService.update({
            ...newServerChat,
            createdAt: new Date(newServerChat.createdAt),
            editedAt: new Date(newServerChat.editedAt),
            status: "server",
          });
        } else {
          await localDBService.update({
            ...serverChat,
            editedAt: new Date(serverChat.editedAt),
            createdAt: new Date(serverChat.createdAt),
            status: "server",
          });
        }
      }
    }
  }
}
