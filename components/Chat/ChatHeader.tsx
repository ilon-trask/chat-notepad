import React from "react";
import { Large} from "../Typography";
import { useChatStore } from "@/store/chatStore";
export default function ChatHeader() {
  const chatStore = useChatStore();

  const chat = chatStore.getChatById(chatStore.chosenChatId);
  return (
    <div className="h-[73px]  border-b border-gray-200 dark:border-gray-800 px-4 flex items-center">
      <Large>{chat?.name||"Select a chat"}</Large>
    </div>
  );
} 