import React from "react";
import ChatHeader from "./ChatHeader";
import MessagesList from "./MessagesList";
import MessageInput from "./MessageInput";
import { cn } from "@/lib/utils";
import { DragAndDropProvider } from "../DrapAndDropPrivider";
import { useParams } from "next/navigation";

function Chat() {
  const params = useParams();
  const chosenChatId = params.chatId as string;
  return (
    <DragAndDropProvider className={cn("flex flex-col h-full")}>
      <ChatHeader />
      <MessagesList />
      {chosenChatId && <MessageInput />}
    </DragAndDropProvider>
  );
}

export default Chat;
