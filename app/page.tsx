"use client";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import Sidebar from "@/components/Sidebar/Sidebar";
import ChatHeader from "@/components/Chat/ChatHeader";
import MessagesList from "@/components/Chat/MessagesList";
import MessageInput from "@/components/Chat/MessageInput";
import { useState } from "react";
import { useChatStore } from "@/store/chatStore";
import useIsMobile from "@/hooks/useIsMobile";
import useDynamicFavicon from "@/hooks/useDynamicFavicon";
import useMaxMinPanelWidth from "@/hooks/useMaxMinPanelWidth";
import useSyncOnConnection from "@/hooks/useSyncOnConnection";
import Chat from "@/components/Chat/Chat";

export default function Page() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { maxSize, minSize } = useMaxMinPanelWidth();
  const isMobile = useIsMobile();
  const { chosenChatId } = useChatStore();

  useDynamicFavicon();
  useSyncOnConnection();

  if (isMobile) {
    if (chosenChatId) {
      return (
        <div className="flex flex-col h-screen">
          <ChatHeader />
          <MessagesList />
          <MessageInput />
        </div>
      );
    }

    return (
      <div className="h-screen">
        <Sidebar variant="regular" />
      </div>
    );
  }

  return (
    <ResizablePanelGroup
      id="chat-layout"
      direction="horizontal"
      className="max-h-screen flex flex-col"
    >
      {/* Sidebar */}
      <ResizablePanel
        id="sidebar"
        defaultSize={25}
        minSize={minSize}
        collapsible
        collapsedSize={maxSize}
        onCollapse={() => setIsCollapsed(true)}
        onExpand={() => setIsCollapsed(false)}
        className="flex flex-col"
      >
        {!isCollapsed ? (
          <Sidebar variant="regular" />
        ) : (
          <Sidebar variant="mini" />
        )}
      </ResizablePanel>
      <ResizableHandle />
      {/* Main Content */}
      <ResizablePanel id="chat" className="flex flex-col">
        <Chat />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
