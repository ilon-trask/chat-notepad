import React from "react";
import ChatHeader from "./ChatHeader";
import MessagesList from "./MessagesList";
import MessageInput from "./MessageInput";
import { useChatStore } from "@/store/chatStore";
import { cn } from "@/lib/utils";
import { DragAndDropProvider } from "../DrapAndDropPrivider";

function Chat() {
  const { chosenChatId } = useChatStore();
  return (
    <DragAndDropProvider className={cn("flex flex-col h-full")}>
      <ChatHeader />
      <MessagesList />
      {chosenChatId && <MessageInput />}
    </DragAndDropProvider>
  );
}

export default Chat;
