"use client";
import React, { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useForm } from "react-hook-form";
import { useDBContext } from "@/contexts/dbContext";
import chatService from "@/data/chatService";
import { Chat } from "@/types/chat";

export default function Sidebar() {
  return (
    <div className="bg-sidebar border-r border-sidebar-border">
      <SearchBarHeader />
      <ChatList />
    </div>
  );
}

function ChatList() {
  const db = useDBContext();

  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    chatService.getChats(db).then((chats) => setChats(chats));
  }, [db]);

  return (
    <div className="overflow-y-auto h-[calc(100vh-73px)] no-scrollbar">
      <CreateChatDialog />
      {chats.map(({ id, ...el }) => (
        <ChatItem
          key={id}
          name={el.name}
          lastMessage="Last message preview..."
          lastMessageTime=""
        />
      ))}
    </div>
  );
}

function CreateChatDialog() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const db = useDBContext();
  const onSubmit = (data: any) => {
    console.log(data);
    chatService.createChat(db, data.name);
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size={"default"}
          className="px-4 w-full justify-start h-10 border-b-gray-200 border-1 rounded-none"
        >
          <Plus /> Add chat
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Chat</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input placeholder="Chat name" {...register("name")} />
          <DialogFooter>
            <Button type="submit">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ChatItem({
  type = "button",
  name,
  lastMessage,
  lastMessageTime,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  name: string;
  lastMessage: string;
  lastMessageTime: string;
}) {
  return (
    <Button
      type={type}
      variant="ghost"
      className={cn(
        "w-full justify-start p-4 rounded-none hover:bg-sidebar-accent",
        "h-auto"
      )}
      {...props}
    >
      <div className="flex items-center gap-3 w-full">
        <div className="w-12 h-12 bg-sidebar-primary rounded-full shrink-0"></div>
        <div className="flex-1 text-left">
          <div className="flex justify-between">
            <h3 className="font-medium">{name}</h3>
            <span className="text-sm text-muted-foreground">
              {lastMessageTime}
            </span>
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {lastMessage}
          </p>
        </div>
      </div>
    </Button>
  );
}

function SearchBarHeader() {
  return (
    <div className="p-4 border-b border-sidebar-border relative h-[73px]">
      <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search"
        className="pl-9 bg-sidebar-accent rounded-full w-full"
      />
    </div>
  );
}
