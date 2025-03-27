"use client";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import Sidebar from "@/components/Sidebar";
import ChatHeader from "@/components/ChatHeader";
import MessagesList from "@/components/MessagesList";
import MessageInput from "@/components/MessageInput";
import { DbProvider } from "@/contexts/dbContext";

export default function Home() {
  return (
    <DbProvider>
      <ResizablePanelGroup direction="horizontal" className="h-screen">
        {/* Sidebar */}
        <ResizablePanel defaultSize={30} minSize={15} collapsible>
          <Sidebar />
        </ResizablePanel>
        {/* <div> some test</div> */}
        <ResizableHandle />
        {/* Main Content */}
        <ResizablePanel className="flex flex-col">
          <ChatHeader />
          <MessagesList />
          <MessageInput />
        </ResizablePanel>
      </ResizablePanelGroup>
    </DbProvider>
  );
}
