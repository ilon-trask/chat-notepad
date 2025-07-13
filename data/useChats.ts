import { LocalChat } from "@/types/chat.types";
import { useEffect, useMemo, useState } from "react";
import { useServicesContext } from "@/components/ServicesProvider";

function useChats() {
  const [chats, setChats] = useState<LocalChat[]>([]);
  const { chatService } = useServicesContext();
  useEffect(() => {
    const unsubscribe = chatService.localDBService.subscribe(async () => {
      setChats(await chatService.getAll());
    });
    (async () => {
      setChats(await chatService.getAll());
    })();
    return () => {
      unsubscribe();
    };
  }, []);

  const getChatById = (chatId: string) => {
    return useMemo(() => {
      return chats.find((el) => el.id === chatId);
    }, [chatId, chats]);
  };

  return { chats, getChatById };
}

export default useChats;
