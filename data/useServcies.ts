import { useEffect, useState } from "react";
import { createLocalDB } from "./createLocalDB";
import ChatService from "./chatService";
import MessageService from "./messageService";
import { useMessageStore } from "@/store/messageStore";
import { useChatStore } from "@/store/chatStore";
import syncServerClientData from "./syncServerClientData";
import { convex } from "@/components/ConvexClientProvider";
import isOnline from "@/helpers/isOnline";
import { LocalDBService } from "./localDBService";
import { RemoteDBService } from "./remoteDBService";
import DeleteService from "./deleteService";

type Return = {
    chatService: ChatService | null
    messageService: MessageService | null
    deleteService: DeleteService | null
}

export default function useServices(): Return {
    const [chatService, setChatService] = useState<ChatService | null>(null);
    const [messageService, setMessageService] = useState<MessageService | null>(null);
    const [deleteService, setDeleteService] = useState<DeleteService | null>(null);

    const messageStore = useMessageStore();
    const chatStore = useChatStore();

    useEffect(() => {
        (async () => {
            const localDB = await createLocalDB();
            const localDBService = new LocalDBService(localDB);
            const remoteDBService = new RemoteDBService(convex);
            const deleteService = new DeleteService(localDBService);
            const messageService = new MessageService(messageStore, isOnline, localDBService, remoteDBService, deleteService);
            const chatService = new ChatService(messageService, chatStore, isOnline, localDBService, remoteDBService, deleteService);

            setMessageService(messageService);
            setChatService(chatService);
            setDeleteService(deleteService);
            syncServerClientData(messageService, chatService, deleteService);
        })()
    }, []);

    return {
        chatService,
        messageService,
        deleteService
    };
}