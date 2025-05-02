import { useEffect, useState } from "react";
import { createLocalDB } from "./createLocalDB";
import ChatService from "./chatService";
import MessageService from "./messageService";
import { useMessageStore } from "@/store/messageStore";
import { useChatStore } from "@/store/chatStore";

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
            const db = await createLocalDB();
            const messageService = new MessageService(db, messageStore)
            const chatService = new ChatService(db, messageService, chatStore)
            setMessageService(messageService);
            setChatService(chatService);
        })()
    }, []);
    
    return {
        chatService,
        messageService
    };
}