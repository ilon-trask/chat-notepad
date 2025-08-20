import { useMemo } from "react";
import { useServicesContext } from "@/components/ServicesProvider";
import { useLiveQuery } from "dexie-react-hooks";

function useMessages() {
  const { messageService } = useServicesContext();

  const messages =
    useLiveQuery(async () => {
      const messages = await messageService.getAll();
      const res = messages
        .filter((el) => el.type == "message")
        .sort((a, b) => a.createdAt.valueOf() - b.createdAt.valueOf());
      return res;
    }) || [];

  const getMessageForChat = (chatId: string) => {
    return useMemo(() => {
      return messages.filter((el) => el.chatId === chatId);
    }, [chatId, messages]);
  };

  return { messages, getMessageForChat };
}

export default useMessages;
