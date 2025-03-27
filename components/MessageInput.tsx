"use client";
import { Send } from "lucide-react";
import React, { KeyboardEvent } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useForm } from "react-hook-form";
import { useDBContext } from "@/contexts/dbContext";
import { useMessageStore } from "@/store/messageStore";
import { useChatStore } from "@/store/chatStore";
import messageService from "@/data/messageService";

export default function MessageInput() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();
  const db = useDBContext();
  const messageStore = useMessageStore();
  const chatId = useChatStore((state) => state.chosenChatId);
  
  const onSubmit = (data: any) => {
    messageService.createMessage(db, messageStore, data.message, chatId);
    reset();
  };
  
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(onSubmit)();
    }
  };
  
  return (
    <div className="bg-white border-t border-gray-200 p-4 ">
      <div className="flex items-center gap-2">
        <form onSubmit={handleSubmit(onSubmit)} className="flex w-full items-center gap-2">
          <Textarea
            placeholder="Write a message..."
            className="flex-1 bg-gray-100 px-4 py-2 rounded-lg resize-none min-h-[40px] max-h-[240px] no-scrollbar"
            rows={1}
            onKeyDown={handleKeyDown}
            {...register("message")}
          />
          <Button type="submit" size={"icon"} className="p-2 hover:bg-gray-100 rounded-full">
            <Send />
          </Button>
        </form>
      </div>
    </div>
  );
}
