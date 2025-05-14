import { useEffect, useState } from "react";
import { createLocalDB } from "./createLocalDB";
import ChatService from "./chatService";
import MessageService from "./messageService";
import { useMessageStore } from "@/store/messageStore";
import { useChatStore } from "@/store/chatStore";
import { ConvexReactClient } from "convex/react";
import syncServerClientData from "./syncServerClientData";
import { convex } from "@/components/ConvexClientProvider";

type Return = {
    chatService: ChatService | null
    messageService: MessageService | null
    convexDB: ConvexReactClient | null
}

export default function useServices(): Return {
    const [chatService, setChatService] = useState<ChatService | null>(null);
    const [messageService, setMessageService] = useState<MessageService | null>(null);
    const [convexDB, setConvexDB] = useState<ConvexReactClient | null>(null);

    const messageStore = useMessageStore();
    const chatStore = useChatStore();

    useEffect(() => {
        (async () => {
            const db = await createLocalDB();
            const messageService = new MessageService(db, messageStore, convex)
            const chatService = new ChatService(db, messageService, chatStore, convex);
            setMessageService(messageService);
            setChatService(chatService);
            setConvexDB(convex);
            syncServerClientData(convex, messageService, chatService);
        })()
    }, []);

    return {
        chatService,
        messageService,
        convexDB
    };
}