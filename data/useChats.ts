import { LocalChat } from "@/types/data/chat";
import { useEffect, useMemo, useState } from "react";
import { useServicesContext } from "@/components/ServicesProvider";

function useChats() {
  const [chats, setChats] = useState<LocalChat[]>([]);
  const { chatService } = useServicesContext();
  //TODO: remove filters
  useEffect(() => {
    const unsubscribe = chatService.subscribe(async () => {
      setChats(
        (await chatService.getAll())
          .filter((el) => el.type == "chat")
          .sort((a, b) => a.createdAt.valueOf() - b.createdAt.valueOf())
      );
    });
    (async () => {
      setChats(
        (await chatService.getAll())
          .filter((el) => el.type == "chat")
          .sort((a, b) => a.createdAt.valueOf() - b.createdAt.valueOf())
      );
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
