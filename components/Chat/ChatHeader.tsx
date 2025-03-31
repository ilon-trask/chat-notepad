import React from "react";
import { Large } from "../Typography";
import { useChatStore } from "@/store/chatStore";
import useIsMobile from "@/hooks/useIsMobile";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";

export default function ChatHeader() {
  const chatStore = useChatStore();
  const chat = chatStore.getChatById(chatStore.chosenChatId);
  const isMobile = useIsMobile();

  return (
    <div className="h-[73px]  border-b border-gray-200 dark:border-gray-800 px-4 flex items-center justify-between">
      {isMobile ? (
        <div className="flex items-center gap-2">
          <Button
            className="min-w-fit"
            variant="ghost"
            size="icon"
            onClick={() => chatStore.setChosenChatId("")}
          >
            <ArrowLeft /> Back
          </Button>
        </div>
      ) : null}
      <Large>{chat?.name || "Select a chat"}</Large>
    </div>
  );
}
