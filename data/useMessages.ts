import { OfflineMessage } from "@/types/message.types";
import { useEffect, useMemo, useState } from "react";
import { useServicesContext } from "@/components/ServicesProvider";

function useMessages() {
  const [messages, setMessages] = useState<OfflineMessage[]>([]);
  const { messageService } = useServicesContext();
  useEffect(() => {
    const unsubscribe = messageService.localDBService.subscribe(async () => {
      setMessages(await messageService.getAllMessages());
    });
    (async () => {
      setMessages(await messageService.getAllMessages());
    })();
    return () => {
      unsubscribe();
    };
  }, []);

  const getMessageForChat = (chatId: string) => {
    return useMemo(() => {
      return messages.filter((el) => el.chatId === chatId);
    }, [chatId, messages]);
  };

  return { messages, getMessageForChat };
}

export default useMessages;
