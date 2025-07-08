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
    if (!clientChatsIds.includes(chatId)) {
      const newChat = serverChats.find((el) => el.id === chatId);
      if (!newChat) throw new Error("Chat not found");
      await chatService.localDBService.create({
        ...newChat,
        createdAt: new Date(newChat.createdAt),
        editedAt: new Date(newChat.editedAt),
        status: "server",
      });
    } else if (!serverChatsIds.includes(chatId)) {
      const newChat = clientChats.find((el) => el.id === chatId);
      if (!newChat) throw new Error("Chat not found");
      const newServerChat = await chatService.remoteDBService.create({
        id: newChat.id,
        name: newChat.name,
        createdAt: newChat.createdAt.valueOf(),
      });
      await chatService.localDBService.update({
        ...newServerChat,
        createdAt: new Date(newServerChat.createdAt),
        editedAt: new Date(newServerChat.editedAt),
        status: "server",
      });
    } else {
      const isEqualContent =
        JSON.stringify(clientChats.find((el) => el.id === chatId)) ==
        JSON.stringify(serverChats.find((el) => el.id === chatId));
      if (!isEqualContent) {
        const serverChat = serverChats.find((el) => el.id === chatId);
        const clientChat = clientChats.find((el) => el.id === chatId);
        if (!serverChat || !clientChat) throw new Error("Chat not found");
        if (serverChat.editedAt.valueOf() > clientChat.editedAt.valueOf()) {
          const newServerChat = await chatService.remoteDBService.update({
            id: clientChat.id,
            name: clientChat.name,
            editedAt: serverChat.editedAt.valueOf(),
          });
          await chatService.localDBService.update({
            ...newServerChat,
            createdAt: new Date(newServerChat.createdAt),
            editedAt: new Date(newServerChat.editedAt),
            status: "server",
          });
        } else {
          await chatService.localDBService.update({
            ...serverChat,
            editedAt: new Date(serverChat.editedAt),
            createdAt: new Date(serverChat.createdAt),
            status: "server",
          });
        }
      }
    }
  }

  for (const messageId of messageIdSet) {
    if (!clientMessagesIds.includes(messageId)) {
      const newMessage = serverMessages.find((el) => el.id === messageId);
      if (!newMessage) throw new Error("Message not found");
      await messageService.localDBService.create({
        ...newMessage,
        createdAt: new Date(newMessage.createdAt),
        editedAt: new Date(newMessage.editedAt),
        status: "server",
      });
    } else if (!serverMessagesIds.includes(messageId)) {
      const newMessage = clientMessages.find((el) => el.id === messageId);
      if (!newMessage) throw new Error("Message not found");
      const newServerMessage = await messageService.remoteDBService.create({
        id: newMessage.id,
        content: newMessage.content,
        chatId: newMessage.chatId,
        createdAt: newMessage.createdAt.valueOf(),
        editedAt: newMessage.editedAt.valueOf(),
      });
      await messageService.localDBService.update({
        ...newServerMessage,
        createdAt: new Date(newServerMessage.createdAt),
        editedAt: new Date(newServerMessage.editedAt),
        status: "server",
      });
    } else {
      const isEqualContent =
        JSON.stringify(clientMessages.find((el) => el.id === messageId)) ==
        JSON.stringify(serverMessages.find((el) => el.id === messageId));
      if (!isEqualContent) {
        const serverMessage = serverMessages.find((el) => el.id === messageId);
        const clientMessage = clientMessages.find((el) => el.id === messageId);
        if (!serverMessage || !clientMessage)
          throw new Error("Message not found");
        if (
          serverMessage.editedAt.valueOf() > clientMessage.editedAt.valueOf()
        ) {
          const newServerMessage = await messageService.remoteDBService.update({
            id: clientMessage.id,
            content: clientMessage.content,
            editedAt: serverMessage.editedAt.valueOf(),
          });
          await messageService.localDBService.update({
            ...newServerMessage,
            createdAt: new Date(newServerMessage.createdAt),
            editedAt: new Date(newServerMessage.editedAt),
            status: "server",
          });
        } else {
          await messageService.localDBService.update({
            ...serverMessage,
            editedAt: new Date(serverMessage.editedAt),
            createdAt: new Date(serverMessage.createdAt),
            status: "server",
          });
        }
      }
    }
  }

  for (const entryId of fileIdSet) {
    if (!clientFilesIds.includes(entryId)) {
      const newChat = serverFiles.find((el) => el.id === entryId);
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
    } else if (!serverFilesIds.includes(entryId)) {
      const newChat = clientFiles.find((el) => el.id === entryId);
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