"use client";
import { Send, X } from "lucide-react";
import React, { KeyboardEvent, useEffect } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useForm } from "react-hook-form";
import { useDBContext } from "@/contexts/dbContext";
import { useMessageStore } from "@/store/messageStore";
import { useChatStore } from "@/store/chatStore";
import { useMessageInputStore } from "@/store/messageInputStore";
import messageService from "@/data/messageService";

type MessageInputForm = {
  message: string;
};

export default function MessageInput() {
  const db = useDBContext();
  const messageStore = useMessageStore();
  const chatId = useChatStore((state) => state.chosenChatId);
  const messageInputStore = useMessageInputStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    setFocus,
  } = useForm<MessageInputForm>();


  useEffect(() => {
    if (messageInputStore.isUpdate) {
      setValue("message", messageInputStore.message);
      setFocus("message");
    }
  }, [
    messageInputStore.isUpdate,
    messageInputStore.messageId,
    setValue,
    setFocus,
  ]);

  const onSubmit = (data: MessageInputForm) => {
    if (messageInputStore.isUpdate) {
      messageService.updateMessage(db, messageStore, {
        chatId,
        content: data.message,
        editedAt: new Date(),
        id: messageInputStore.messageId,
      });
      messageInputStore.cancelEditing();
    } else {
      messageService.createMessage(db, messageStore, data.message, chatId);
    }
    reset();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(onSubmit)();
    } else if (e.key === "Escape" && messageInputStore.isUpdate) {
      cancelEdit();
      reset();
    }
  };

  const cancelEdit = () => {
    messageInputStore.cancelEditing();
    reset();
  };

  return (
    <div className="flex flex-col  border-t border-gray-200 dark:border-gray-800  ">
      {/* Edit indicator */}
      {messageInputStore.isUpdate && (
        <div className="px-4 py-2 bg-muted/50 flex items-center justify-between border-b">
          <span className="text-sm text-muted-foreground">Editing message</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={cancelEdit}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Input area */}
      <div className="p-4">
        <div className="flex items-center gap-2">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex w-full items-center gap-2"
          >
            <Textarea
              id="message-textarea"
              placeholder={
                messageInputStore.isUpdate
                  ? "Edit message..."
                  : "Write a message..."
              }
              className="flex-1 bg-muted/50 px-4 py-2 rounded-lg resize-none min-h-[40px] max-h-[240px] no-scrollbar outline-none"
              rows={1}
              onKeyDown={handleKeyDown}
              {...register("message")}
            />
            <Button
              type="submit"
              size="icon"
              className="rounded-full"
              variant={messageInputStore.isUpdate ? "secondary" : "default"}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
