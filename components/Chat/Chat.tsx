import React from "react";
import ChatHeader from "./ChatHeader";
import MessagesList from "./MessagesList";
import MessageInput from "./MessageInput";
import { useChatStore } from "@/store/chatStore";
import { cn } from "@/lib/utils";
import DragDropZone from "./DragDropZone";

function Chat() {
  const { chosenChatId } = useChatStore();

  return (
    <DragDropZone className={cn("flex flex-col h-full")}>
      <ChatHeader />
      <MessagesList />
      {chosenChatId && <MessageInput />}
    </DragDropZone>
  );
}

export default Chat;
