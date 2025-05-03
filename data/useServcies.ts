import { useEffect, useState } from "react";
import { createLocalDB } from "./createLocalDB";
import ChatService from "./chatService";
import MessageService from "./messageService";
import { useMessageStore } from "@/store/messageStore";
import { useChatStore } from "@/store/chatStore";
import { ConvexReactClient } from "convex/react";
import syncServerClientData from "./syncServerClientData";

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
            const convexDB = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
            const messageService = new MessageService(db, messageStore, convexDB)
            const chatService = new ChatService(db, messageService, chatStore, convexDB);
            setMessageService(messageService);
            setChatService(chatService);
            setConvexDB(convexDB);
            syncServerClientData(convexDB, messageService, chatService);
        })()
    }, []);

    return {
        chatService,
        messageService,
        convexDB
    };
}