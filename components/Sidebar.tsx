"use client";
import React, { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Edit, MoreVertical, Plus, Search, Trash2 } from "lucide-react";
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
import { useChatStore } from "@/store/chatStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useMessageStore } from "@/store/messageStore";
import confirmableDelete from "@/helpers/confirmableDelete";
import { Chat } from "@/types/chat";
import { useChatDialogStore } from "@/store/chatDialogStore";

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
  const chatStore = useChatStore();

  useEffect(() => {
    chatService.getAllChats(db, chatStore);
  }, []);

  return (
    <div className="overflow-y-auto h-[calc(100vh-73px)] no-scrollbar">
      <CreateChatDialog />
      {chatStore.chats.toReversed().map(({ id, ...el }) => (
        <ChatItem
          key={id}
          id={id}
          name={el.name}
          lastMessage="Last message preview..."
          lastMessageTime=""
          onClick={() => chatStore.setChosenChatId(id)}
          isActive={chatStore.chosenChatId === id}
        />
      ))}
    </div>
  );
}

function ChatItem({
  type = "button",
  id,
  name,
  lastMessage,
  lastMessageTime,
  isActive = false,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  id: string;
  name: string;
  lastMessage: string;
  lastMessageTime: string;
  isActive?: boolean;
}) {
  const db = useDBContext();
  const chatStore = useChatStore();
  const messageStore = useMessageStore();
  const chatDialogStore = useChatDialogStore();

  return (
    <div className="relative group">
      <Button
        type={type}
        variant="ghost"
        className={cn(
          "w-full justify-start p-4 rounded-none hover:bg-sidebar-accent",
          "h-auto",
          isActive && "bg-sidebar-accent text-primary border-l-4 border-primary"
        )}
        {...props}
      >
        <div className="flex items-center gap-3 w-full">
          <div
            className={cn(
              "w-12 h-12 bg-sidebar-primary rounded-full shrink-0",
              isActive && "border-2 border-primary"
            )}
          ></div>
          <div className="flex-1 text-left">
            <div className="flex justify-between">
              <h3 className={"font-medium"}>{name}</h3>
              <span className={"text-sm text-muted-foreground"}>
                {lastMessageTime}
              </span>
            </div>
            <p className={"text-sm text-muted-foreground truncate"}>
              {lastMessage}
            </p>
          </div>
        </div>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => {
              chatDialogStore.setIsOpen(true);
              chatDialogStore.setIsUpdate(true);
              chatDialogStore.setChatId(id);
            }}
          >
            <Edit className="mr-2 h-4 w-4" />
            <span>Edit</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => {
              confirmableDelete<Chat>({
                getEntity: () => chatStore.getChatById(id),
                onDelete: () =>
                  chatService.deleteChat(db, chatStore, messageStore, id),
                onStoreDelete: () => chatStore.deleteChat(id),
                onReverseDelete: (chat: Chat) => chatStore.addChat(chat),
                name: "Chat",
              });
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

type ChatFormData = {
  name: string;
};

function CreateChatDialog() {
  const db = useDBContext();
  const chatStore = useChatStore();
  const chatDialogStore = useChatDialogStore();

  const chat = chatStore.getChatById(chatDialogStore.chatId);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChatFormData>({
    values: {
      name: chat?.name || "",
    },
  });

  const onSubmit = (data: ChatFormData) => {
    if (chatDialogStore.isUpdate) {
      chatService.updateChat(db, chatStore, {
        id: chatDialogStore.chatId,
        name: data.name,
      });
    } else {
      chatService.createChat(db, chatStore, data.name);
    }
    chatDialogStore.setIsOpen(false);
  };

  return (
    <Dialog
      open={chatDialogStore.isOpen}
      onOpenChange={(e) => {
        chatDialogStore.setIsOpen(e);
      }}
    >
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
