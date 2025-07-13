import { CHAT_LABEL, FILE_LABEL, MESSAGE_LABEL } from "@/constants/labels";
import { DeleteLocalDBService } from "./delete/deleteLocalDBService";
import { DBService } from "./DBService";

export default async function syncServerClientData({
  chatService,
  deleteService,
  fileService,
  messageService,
}: {
  chatService: DBService<typeof CHAT_LABEL>;
  messageService: DBService<typeof MESSAGE_LABEL>;
  fileService: DBService<typeof FILE_LABEL>;
  deleteService: DeleteLocalDBService;
}) {
  const deletes = await deleteService.getAll();

  for (const deleteItem of deletes) {
    if (deleteItem.type === CHAT_LABEL) {
      await chatService.remoteDBService.delete(deleteItem.entityId);
      deleteService.delete(deleteItem.id);
    } else if (deleteItem.type === MESSAGE_LABEL) {
      await messageService.remoteDBService.delete(deleteItem.entityId);
      await fileService.delete(deleteItem.entityId);
      deleteService.delete(deleteItem.id);
    } else if (deleteItem.type === FILE_LABEL) {
      await fileService.remoteDBService.delete(deleteItem.entityId);
      deleteService.delete(deleteItem.id);
    }
  }
  const serverChats = await chatService.remoteDBService.getAll();
  const clientChats = await chatService.localDBService.getAll();
  const serverChatsIds = serverChats.map((el) => el.id);
  const clientChatsIds = clientChats.map((el) => el.id);

  const serverMessages = await messageService.remoteDBService.getAll();
  const clientMessages = await messageService.localDBService.getAll();
  const serverMessagesIds = serverMessages.map((el) => el.id);
  const clientMessagesIds = clientMessages.map((el) => el.id);

  const serverFiles = await fileService.remoteDBService.getAll();
  const clientFiles = await fileService.localDBService.getAll();
  const serverFilesIds = serverFiles.map((el) => el.id);
  const clientFilesIds = clientFiles.map((el) => el.id);

  const chatIdSet = new Set([...clientChatsIds, ...serverChatsIds]);
  const messageIdSet = new Set([...clientMessagesIds, ...serverMessagesIds]);
  const fileIdSet = new Set([...clientFilesIds, ...serverFilesIds]);

  for (const chatId of chatIdSet) {
    const serverChat = serverChats.find((el) => el.id === chatId);
    const clientChat = clientChats.find((el) => el.id === chatId);
    if (!clientChat) {
      if (!serverChat) throw new Error("Chat not found");
      await chatService.localDBService.create(serverChat);
    } else if (!serverChat) {
      if (!clientChat) throw new Error("Chat not found");
      const newServerChat =
        await chatService.remoteDBService.create(clientChat);
      await chatService.localDBService.update(newServerChat);
    } else {
      const isEqualContent =
        serverChat.editedAt.valueOf() > clientChat.editedAt.valueOf();
      if (!isEqualContent) {
        if (!serverChat || !clientChat) throw new Error("Chat not found");
        if (serverChat.editedAt.valueOf() > clientChat.editedAt.valueOf()) {
          const newServerChat =
            await chatService.remoteDBService.update(clientChat);
          await chatService.localDBService.update(newServerChat);
        } else {
          await chatService.localDBService.update(serverChat);
        }
      }
    }
  }

  for (const messageId of messageIdSet) {
    const serverMessage = serverMessages.find((el) => el.id === messageId);
    const clientMessage = clientMessages.find((el) => el.id === messageId);
    if (!clientMessage) {
      if (!serverMessage) throw new Error("Message not found");
      await messageService.localDBService.create({
        ...serverMessage,
        createdAt: new Date(serverMessage.createdAt),
        editedAt: new Date(serverMessage.editedAt),
        status: "server",
      });
    } else if (!serverMessage) {
      if (!clientMessage) throw new Error("Message not found");
      const newServerMessage =
        await messageService.remoteDBService.create(clientMessage);
      await messageService.localDBService.update(newServerMessage);
    } else {
      const isEqualContent =
        serverMessage.editedAt.valueOf() > clientMessage.editedAt.valueOf();
      if (!isEqualContent) {
        const serverMessage = serverMessages.find((el) => el.id === messageId);
        const clientMessage = clientMessages.find((el) => el.id === messageId);
        if (!serverMessage || !clientMessage)
          throw new Error("Message not found");
        if (
          serverMessage.editedAt.valueOf() > clientMessage.editedAt.valueOf()
        ) {
          const newServerMessage =
            await messageService.remoteDBService.update(serverMessage);
          await messageService.localDBService.update(newServerMessage);
        } else {
          await messageService.localDBService.update(serverMessage);
        }
      }
    }
  }

  for (const entryId of fileIdSet) {
    if (!clientFilesIds.includes(entryId)) {
      const newChat = serverFiles.find((el) => el.id === entryId);
      if (!newChat) throw new Error("Chat not found");
      await fileService.localDBService.create(newChat);
    } else if (!serverFilesIds.includes(entryId)) {
      const newChat = clientFiles.find((el) => el.id === entryId);
      if (!newChat) throw new Error("Chat not found");
      const newServerChat = await fileService.create(newChat);
      await fileService.localDBService.update(newServerChat);
    }
  }
}
