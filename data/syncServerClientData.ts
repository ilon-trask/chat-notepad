import MessageService from "./messageService";
import ChatService from "./chatService";
import DeleteService from "./deleteService";
import { CHAT_LABEL, MESSAGE_LABEL } from "@/constants/labels";
import { FileService } from "./fileService";

export default async function syncServerClientData({
  chatService,
  messageService,
  deleteService,
  fileService,
}: {
  messageService: MessageService;
  chatService: ChatService;
  deleteService: DeleteService;
  fileService: FileService;
}) {
  const deletes = await deleteService.getAllDelete();

  for (const deleteItem of deletes) {
    if (deleteItem.type === CHAT_LABEL) {
      await chatService.remoteDBService.deleteChat(deleteItem.entity_id);
      deleteService.deleteDelete(deleteItem.id);
    } else if (deleteItem.type === MESSAGE_LABEL) {
      await messageService.remoteDBService.deleteMessage(deleteItem.entity_id);
      await fileService.deleteMessageFiles(deleteItem.entity_id);
      deleteService.deleteDelete(deleteItem.id);
    }
  }

  const serverChats = await chatService.remoteDBService.getAllChats();
  const serverMessages = await messageService.remoteDBService.getAllMessages();
  const serverChatsIds = serverChats.map((el) => el.id);
  const serverMessagesIds = serverMessages.map((el) => el.id);
  const clientChats = await chatService.localDBService.getAllChats();
  const clientMessages = await messageService.localDBService.getAllMessages();
  const clientChatsIds = clientChats.map((el) => el.id);
  const clientMessagesIds = clientMessages.map((el) => el.id);

  const chatIdSet = new Set([...clientChatsIds, ...serverChatsIds]);
  const messageIdSet = new Set([...clientMessagesIds, ...serverMessagesIds]);
  for (const chatId of chatIdSet) {
    if (!clientChatsIds.includes(chatId)) {
      const newChat = serverChats.find((el) => el.id === chatId);
      if (!newChat) throw new Error("Chat not found");
      await chatService.localDBService.createChat({
        ...newChat,
        createdAt: new Date(newChat.createdAt),
        editedAt: new Date(newChat.editedAt),
      });
    } else if (!serverChatsIds.includes(chatId)) {
      const newChat = clientChats.find((el) => el.id === chatId);
      if (!newChat) throw new Error("Chat not found");
      const newServerChat = await chatService.remoteDBService.createChat({
        id: newChat.id,
        name: newChat.name,
        createdAt: newChat.createdAt.valueOf(),
      });
      await chatService.localDBService.updateChat({
        ...newServerChat,
        createdAt: new Date(newServerChat.createdAt),
        editedAt: new Date(newServerChat.editedAt),
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
          const newServerChat = await chatService.remoteDBService.updateChat({
            _id: clientChat._id!,
            name: clientChat.name,
            editedAt: serverChat.editedAt.valueOf(),
          });
          await chatService.localDBService.updateChat({
            ...newServerChat,
            createdAt: new Date(newServerChat.createdAt),
            editedAt: new Date(newServerChat.editedAt),
          });
        } else {
          await chatService.localDBService.updateChat({
            ...serverChat,
            editedAt: new Date(serverChat.editedAt),
            createdAt: new Date(serverChat.createdAt),
          });
        }
      }
    }
  }

  for (const messageId of messageIdSet) {
    if (!clientMessagesIds.includes(messageId)) {
      const newMessage = serverMessages.find((el) => el.id === messageId);
      if (!newMessage) throw new Error("Message not found");
      await messageService.localDBService.createMessage({
        ...newMessage,
        createdAt: new Date(newMessage.createdAt),
        editedAt: new Date(newMessage.editedAt),
      });
    } else if (!serverMessagesIds.includes(messageId)) {
      const newMessage = clientMessages.find((el) => el.id === messageId);
      if (!newMessage) throw new Error("Message not found");
      const newServerMessage =
        await messageService.remoteDBService.createMessage({
          id: newMessage.id,
          content: newMessage.content,
          chatId: newMessage.chatId,
          createdAt: newMessage.createdAt.valueOf(),
          editedAt: newMessage.editedAt.valueOf(),
        });
      await messageService.localDBService.updateMessage({
        ...newServerMessage,
        createdAt: new Date(newServerMessage.createdAt),
        editedAt: new Date(newServerMessage.editedAt),
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
          const newServerMessage =
            await messageService.remoteDBService.updateMessage({
              _id: clientMessage._id!,
              content: clientMessage.content,
              editedAt: serverMessage.editedAt.valueOf(),
            });
          await messageService.localDBService.updateMessage({
            ...newServerMessage,
            createdAt: new Date(newServerMessage.createdAt),
            editedAt: new Date(newServerMessage.editedAt),
          });
        } else {
          await messageService.localDBService.updateMessage({
            ...serverMessage,
            editedAt: new Date(serverMessage.editedAt),
            createdAt: new Date(serverMessage.createdAt),
          });
        }
      }
    }
  }
  chatService.getAllChats();
  messageService.getAllMessages();
}
