import useUIStore from "./UIStore";
import { useMemo } from "react";

function useMessages() {
  const UIStore = useUIStore();

  const messages = UIStore.getAll();

  let res = useMemo(() => messages
    .filter((el) => el.type == "message")
    .sort((a, b) => a.createdAt.valueOf() - b.createdAt.valueOf()), [messages])

  const getMessageForChat = (chatId: string) => {
    return useMemo(() => res.filter((el) => el.chatId === chatId), [res, chatId])
  };

  return { messages: res, getMessageForChat };
}

export default useMessages;
