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
import { DbProvider } from "@/contexts/dbContext";
import { useEffect, useState } from "react";

export default function Home() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [minSize, setMinSize] = useState(15);
  const [maxSize, setMaxSize] = useState(30);

  useEffect(() => {
    const calculateMinSize = () => {
      const newMinSize = Math.ceil((250 / window.innerWidth) * 100);
      const newMaxSize = Math.ceil((80 / window.innerWidth) * 100);
      setMinSize(newMinSize);
      setMaxSize(newMaxSize);
    };

    calculateMinSize();

    window.addEventListener("resize", calculateMinSize);

    return () => {
      window.removeEventListener("resize", calculateMinSize);
    };
  }, []);

  return (
    <DbProvider>
      <ResizablePanelGroup direction="horizontal" className="h-screen">
        {/* Sidebar */}
        <ResizablePanel
          defaultSize={25}
          minSize={minSize}
          collapsible
          collapsedSize={maxSize}
          onCollapse={() => setIsCollapsed(true)}
          onExpand={() => setIsCollapsed(false)}
        >
          {!isCollapsed ? <Sidebar variant="regular" /> : <Sidebar variant="mini" />}
        </ResizablePanel>
        <ResizableHandle />
        {/* Main Content */}
        <ResizablePanel className="flex flex-col max-h-screen">
          <ChatHeader />
          <MessagesList />
          <MessageInput />
        </ResizablePanel>
      </ResizablePanelGroup>
    </DbProvider>
  );
}
