"use client";
import Chat from "@/components/Chat/Chat";
import ChatHeader from "@/components/Chat/ChatHeader";
import MessageInput from "@/components/Chat/MessageInput";
import MessagesList from "@/components/Chat/MessagesList";
import Sidebar from "@/components/Sidebar/Sidebar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import useSyncIndexDbAndView from "@/data/useSyncIndexDbAndView";
import useDynamicFavicon from "@/hooks/useDynamicFavicon";
import useIsMobile from "@/hooks/useIsMobile";
import useMaxMinPanelWidth from "@/hooks/useMaxMinPanelWidth";
import useSync from "@/hooks/useSyncOnConnection";
import { useParams } from "next/navigation";
import React, { useState } from "react";

function Layout({}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { maxSize, minSize } = useMaxMinPanelWidth();
  const isMobile = useIsMobile();
  const params = useParams();
  const chatId = params.chatId as string;

  useDynamicFavicon();
  useSync();
  useSyncIndexDbAndView();

  if (isMobile) {
    if (chatId) {
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
    <>
      <ResizablePanelGroup
        id="chat-layout"
        direction="horizontal"
        className="max-h-screen flex flex-col"
      >
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
        <ResizablePanel id="chat" className="flex flex-col">
          {/* TODO: if I put children here app doesn't work */}
          <Chat />
        </ResizablePanel>
      </ResizablePanelGroup>
    </>
  );
}

export default Layout;
