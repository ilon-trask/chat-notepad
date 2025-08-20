import { useMemo } from "react";
import { useServicesContext } from "@/components/ServicesProvider";
import { useLiveQuery } from "dexie-react-hooks";

function useChats() {
  const { chatService } = useServicesContext();

  const chats =
    useLiveQuery(async () =>
      (await chatService.getAll())
        .filter((el) => el.type == "chat")
        .sort((a, b) => a.createdAt.valueOf() - b.createdAt.valueOf())
    ) ?? [];

  const getChatById = (chatId: string) => {
    return useMemo(() => {
      return chats.find((el) => el.id === chatId);
    }, [chatId, chats]);
  };

  return { chats, getChatById };
}

export default useChats;
