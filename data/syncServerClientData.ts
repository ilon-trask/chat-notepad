import MessageService from "./messageService";
import ChatService from "./chatService";

export default async function syncServerClientData(
    messageService: MessageService,
    chatService: ChatService
) {
    const serverChats = await chatService.getAllOnlineChats();
    const serverMessages = await messageService.getAllOnlineMessages();
    const serverChatsIds = serverChats.map((el) => el.id);
    const serverMessagesIds = serverMessages.map((el) => el.id);
    const clientChats = await chatService.getAllChats();
    const clientMessages = await messageService.getAllMessages();
    const clientChatsIds = clientChats.map((el) => el.id);
    const clientMessagesIds = clientMessages.map((el) => el.id);

    const chatIdSet = new Set([...clientChatsIds, ...serverChatsIds]);
    const messageIdSet = new Set([...clientMessagesIds, ...serverMessagesIds]);
    for (const chatId of chatIdSet) {
        if (!clientChatsIds.includes(chatId)) {
            const newChat = serverChats.find((el) => el.id === chatId);
            if (!newChat) throw new Error("Chat not found");
            await chatService.createOfflineChat({ ...newChat, createdAt: new Date(newChat.createdAt), editedAt: new Date(newChat.editedAt) });
        } else
            if (!serverChatsIds.includes(chatId)) {
                const newChat = clientChats.find((el) => el.id === chatId);
                if (!newChat) throw new Error("Chat not found");
                const newServerChat = await chatService.createOnlineChat({ id: newChat.id, name: newChat.name, createdAt: newChat.createdAt.valueOf() });
                await chatService.updateOfflineChat({ ...newServerChat, createdAt: new Date(newServerChat.createdAt), editedAt: new Date(newServerChat.editedAt) });
            } else {
                const isEqualContent = JSON.stringify(clientChats.find((el) => el.id === chatId)) == JSON.stringify(serverChats.find((el) => el.id === chatId));
                if (!isEqualContent) {
                    const serverChat = serverChats.find((el) => el.id === chatId);
                    const clientChat = clientChats.find((el) => el.id === chatId);
                    if (!serverChat || !clientChat) throw new Error("Chat not found");
                    if (serverChat.editedAt.valueOf() > clientChat.editedAt.valueOf()) {
                        const newServerChat = await chatService.updateOnlineChat({
                            _id: clientChat._id!,
                            name: clientChat.name,
                            editedAt: serverChat.editedAt.valueOf()
                        });
                        await chatService.updateOfflineChat({ ...newServerChat, createdAt: new Date(newServerChat.createdAt), editedAt: new Date(newServerChat.editedAt) });
                    }
                    else {
                        await chatService.updateOfflineChat({
                            ...serverChat,
                            editedAt: new Date(serverChat.editedAt),
                            createdAt: new Date(serverChat.createdAt)
                        });
                    }
                }
            }
    }
    for (const messageId of messageIdSet) {
        if (!clientMessagesIds.includes(messageId)) {
            const newMessage = serverMessages.find((el) => el.id === messageId);
            if (!newMessage) throw new Error("Message not found");
            await messageService.createOfflineMessage({ ...newMessage, createdAt: new Date(newMessage.createdAt), editedAt: new Date(newMessage.editedAt) });
        } else
            if (!serverMessagesIds.includes(messageId)) {
                const newMessage = clientMessages.find((el) => el.id === messageId);
                if (!newMessage) throw new Error("Message not found");
                const newServerMessage = await messageService.createOnlineMessage({
                    id: newMessage.id,
                    content: newMessage.content,
                    chatId: newMessage.chatId,
                    createdAt: newMessage.createdAt.valueOf(),
                    editedAt: newMessage.editedAt.valueOf()
                });
                await messageService.updateOfflineMessage({ ...newServerMessage, createdAt: new Date(newServerMessage.createdAt), editedAt: new Date(newServerMessage.editedAt) });
            } else {
                const isEqualContent = JSON.stringify(clientMessages.find((el) => el.id === messageId)) == JSON.stringify(serverMessages.find((el) => el.id === messageId));
                if (!isEqualContent) {
                    const serverMessage = serverMessages.find((el) => el.id === messageId);
                    const clientMessage = clientMessages.find((el) => el.id === messageId);
                    if (!serverMessage || !clientMessage) throw new Error("Message not found");
                    if (serverMessage.editedAt.valueOf() > clientMessage.editedAt.valueOf()) {
                        const newServerMessage = await messageService.updateOnlineMessage(
                            {
                                _id: clientMessage._id!,
                                content: clientMessage.content,
                                editedAt: serverMessage.editedAt.valueOf()
                            });
                        await messageService.updateOfflineMessage({ ...newServerMessage, createdAt: new Date(newServerMessage.createdAt), editedAt: new Date(newServerMessage.editedAt) });
                    } else {
                        await messageService.updateOfflineMessage(
                            {
                                ...serverMessage,
                                editedAt: new Date(serverMessage.editedAt),
                                createdAt: new Date(serverMessage.createdAt)
                            });
                    }
                }
            }
    }
}