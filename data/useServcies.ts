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

type Return = {
    chatService: ChatService | null
    messageService: MessageService | null
}

export default function useServices(): Return {
    const [chatService, setChatService] = useState<ChatService | null>(null);
    const [messageService, setMessageService] = useState<MessageService | null>(null);

    const messageStore = useMessageStore();
    const chatStore = useChatStore();

    useEffect(() => {
        (async () => {
            const localDB = await createLocalDB();
            const localDBService = new LocalDBService(localDB);
            const remoteDBService = new RemoteDBService(convex);
            const messageService = new MessageService(messageStore, isOnline, localDBService, remoteDBService);
            const chatService = new ChatService(messageService, chatStore, isOnline, localDBService, remoteDBService);
            setMessageService(messageService);
            setChatService(chatService);
            syncServerClientData(messageService, chatService);
        })()
    }, []);

    return {
        chatService,
        messageService
    };
}