import { useMemo } from "react";
import useUIStore from "./UIStore";

function useChats() {
  const UIStore = useUIStore();

  const chats = UIStore.getAll()
    .filter((el) => el.type == "chat")
    .sort((a, b) => a.createdAt.valueOf() - b.createdAt.valueOf());

  const getChatById = (chatId: string) => {
    return useMemo(() => {
      return chats.find((el) => el.id === chatId);
    }, [chatId, chats]);
  };

  return { chats, getChatById };
}

export default useChats;
