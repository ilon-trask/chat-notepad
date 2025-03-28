import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { useMessageStore } from "@/store/messageStore";
import { useChatStore } from "@/store/chatStore";
import { type Message } from "@/types/message";
import { Badge } from "./ui/badge";
import messageService from "@/data/messageService";
import { useDBContext } from "@/contexts/dbContext";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "./ui/context-menu";
import { Edit, Trash2 } from "lucide-react";
import confirmableDelete from "@/helpers/confirmableDelete";

export default function MessagesList() {
  const db = useDBContext();
  const messageStore = useMessageStore();
  const chatId = useChatStore((state) => state.chosenChatId);

  useEffect(() => {
    messageService.getAllMessages(db, messageStore);
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-4 pt-auto flex flex-col justify-end">
      {!chatId && (
        <div className="flex justify-center items-center h-full">
          <Badge variant="secondary" className="px-4 py-2 text-sm font-normal">
            Select a chat to start messaging
          </Badge>
        </div>
      )}
      <div className="flex flex-col gap-2">
        {messageStore.getMessages(chatId).map((el) => (
          <Message key={el.id} id={el.id} children={el.content} />
        ))}
      </div>
    </div>
  );
}

function Message({
  children,
  className,
  id,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  id: string;
}) {
  const db = useDBContext();
  const messageStore = useMessageStore();

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <Card
          className={cn(
            "p-3 rounded-lg max-w-[70%] self-start gap-2",
            className
          )}
          {...props}
        >
          <div className="flex flex-col">
            <p>{children}</p>
            <div className="text-xs text-gray-500 text-right text-[10px] mt-1 self-end">
              {new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        </Card>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>
          <Edit className="mr-2 h-4 w-4" />
          <span>Edit</span>
        </ContextMenuItem>
        <ContextMenuItem
          className="text-destructive"
          onClick={() => {
            confirmableDelete<Message>({
              getEntity: () => messageStore.getMessageById(id),
              onDelete: () =>
                messageService.deleteMessage(db, messageStore, id),
              onStoreDelete: () => messageStore.deleteMessage(id),
              onReverseDelete: (message: Message) =>
                messageStore.addMessage(message),
              name: "Message",
            });
          }}
        >
          <Trash2 className="mr-2 h-4 w-4 text-destructive" />
          <span>Delete</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
