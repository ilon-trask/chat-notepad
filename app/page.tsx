'use client'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import Sidebar from "@/components/Sidebar";
import ChatHeader from "@/components/ChatHeader";
import MessagesList from "@/components/MessagesList";
import MessageInput from "@/components/MessageInput";
import { useDatabase } from "@/hooks/useDatabase";
import { useEffect } from "react";

export default function Home() {
  const { isLoading, db } = useDatabase();
  useEffect(()=>{console.log(isLoading,db)},[isLoading])
  if(isLoading) return <div>Loading...</div>
  if(!db) return <div>Error</div>
  // db.transaction('chat)
  return (
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
  );
}
