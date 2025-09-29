"use client";
import { Paperclip, Send, X } from "lucide-react";
import React, { KeyboardEvent, useEffect } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useForm } from "react-hook-form";
import { useMessageInputStore } from "@/store/messageInputStore";
import { Muted } from "../Typography";
import { toast } from "sonner";
import { useServicesContext } from "../ServicesProvider";
import previewFileUploadHandler from "@/data/fileUploadHandler";
import FileBubble from "./FileBubble";
import { v4 as uuid } from "uuid";
import useMessages from "@/data/useMessages";
import { useDynamicChatId } from "@/hooks/useDynamicChatId";

type MessageInputForm = {
  message: string;
};

export default function MessageInput() {
  const { messageService, fileService } = useServicesContext();
  const chatId = useDynamicChatId();

  const messageInputStore = useMessageInputStore();
  const { messages } = useMessages();

  const { register, handleSubmit, reset, setValue, setFocus } =
    useForm<MessageInputForm>();

  useEffect(() => {
    if (messageInputStore.isUpdate) {
      setValue("message", messageInputStore.message);
    }
    setFocus("message");
  }, [
    messageInputStore.toFocus,
    messageInputStore.isUpdate,
    messageInputStore.messageId,
    setValue,
    setFocus,
  ]);

  const onSubmit = async (data: MessageInputForm) => {
    if (data.message.trim() === "" || !chatId) {
      toast.error("Please enter a message and select a chat");
      return;
    }
    if (messageInputStore.isUpdate) {
      const files = (await fileService.getAll()).filter(
        (el) => el.messageId === messageInputStore.messageId
      );
      files.forEach((file) => {
        if (!messageInputStore.fileUpload.find((el) => el.id === file.id)) {
          fileService.delete(file.id, file.type);
        }
      });

      await Promise.all(
        messageInputStore.fileUpload.map(async (el) => {
          if (!files.find((file) => file.id === el.id)) {
            const res = await fileService.create(el);
            return res;
          }
        })
      );

      const message = messages.find(
        (el) => el.id == messageInputStore.messageId
      );

      if (!message)
        throw new Error(
          `Can't update message: message with id="${messageInputStore.messageId}" does not exist`
        );

      messageService.update(messageInputStore.messageId, {
        type: "message",
        content: data.message,
      });
      messageInputStore.cancelEditing();
    } else {
      const message = await messageService.create({
        id: uuid(),
        content: data.message,
        type: "message",
        chatId,
        createdAt: new Date(),
        editedAt: new Date(),
      });
      await Promise.all(
        messageInputStore.fileUpload.map(async (el) => {
          const res = await fileService.create({
            ...el,
            messageId: message.id,
          });
          return res;
        })
      );
    }
    reset();
    messageInputStore.setFileUpload([]);
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
    <div
      data-testid="MessageInput"
      className="flex flex-col  border-t border-gray-200 dark:border-gray-800"
    >
      {/* Edit indicator */}
      {messageInputStore.isUpdate && (
        <div
          data-testid="EditIndicator"
          className="px-4 py-2 bg-muted/50 flex items-center justify-between border-b"
        >
          <Muted>Editing message</Muted>
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

      {messageInputStore.fileUpload.length > 0 && (
        <div
          data-testid="FileUploadingIndicator"
          className="px-4 py-2 bg-muted/50 flex items-center gap-4 flex-wrap border-b"
        >
          {messageInputStore.fileUpload.map((el) => (
            <FileBubble key={el.name} file={el} />
          ))}
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center gap-2">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex w-full items-center gap-2"
          >
            <Textarea
              data-testid="MessageInputTextarea"
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
              data-testid="MessageInputAttachButton"
              type="button"
              size="icon"
              className="rounded-full"
              variant="ghost"
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              <Paperclip className="h-4 w-4" />
              <input
                id="file-upload"
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const files = e.target.files;
                  previewFileUploadHandler(files, messageInputStore);
                }}
              />
            </Button>
            <Button
              data-testid="MessageInputSendButton"
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
