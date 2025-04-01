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
import { useEffect, useState } from "react";
import { useChatStore } from "@/store/chatStore";
import useIsMobile from "@/hooks/useIsMobile";
import useDynamicFavicon from "@/hooks/useDynamicFavicon";

export default function Home() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [minSize, setMinSize] = useState(15);
  const [maxSize, setMaxSize] = useState(30);
  const isMobile = useIsMobile();
  const { chosenChatId } = useChatStore();

  useDynamicFavicon();

  useEffect(() => {
    const calculateMinSize = () => {
      const windowWidth = window.innerWidth;
      const newMinSize = Math.ceil((250 / windowWidth) * 100);
      const newMaxSize = Math.ceil((80 / windowWidth) * 100);
      setMinSize(newMinSize);
      setMaxSize(newMaxSize);
    };

    calculateMinSize();

    window.addEventListener("resize", calculateMinSize);

    return () => {
      window.removeEventListener("resize", calculateMinSize);
    };
  }, []);

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
      className="h-screen"
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
      >
        {!isCollapsed ? (
          <Sidebar variant="regular" />
        ) : (
          <Sidebar variant="mini" />
        )}
      </ResizablePanel>
      <ResizableHandle />
      {/* Main Content */}
      <ResizablePanel id="chat" className="flex flex-col h-screen">
        <ChatHeader />
        <MessagesList />
        <MessageInput />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
