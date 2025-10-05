"use client";
import React from "react";
import ChatHeader from "./ChatHeader";
import MessagesList from "./MessagesList";
import MessageInput from "./MessageInput";
import { cn } from "@/lib/utils";
import { DragAndDropProvider } from "../DrapAndDropPrivider";
import { useDynamicChatId } from "@/hooks/useDynamicChatId";

function Chat() {
  const chosenChatId = useDynamicChatId();
  return (
    <DragAndDropProvider className={cn("flex flex-col h-full")}>
      <ChatHeader />
      <MessagesList />
      {chosenChatId && <MessageInput />}
    </DragAndDropProvider>
  );
}

export default Chat;
