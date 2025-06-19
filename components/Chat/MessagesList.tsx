import React, { useEffect, useRef, useState } from "react";
import { type Message } from "@/types/message.types";
import { Badge } from "../ui/badge";
import MessageItem from "./MessageItem";
import { useDragAndDrop } from "../DrapAndDropPrivider";
import useMessages from "@/data/useMessages";
import { useParams } from "next/navigation";

export default function MessagesList() {
  const params = useParams();
  const chatId = params.chatId as string;
  const messages = useMessages().getMessageForChat(chatId);
  const { isDragging } = useDragAndDrop();
  console.log("isDragging", isDragging);

  const [dateMap, setDateMap] = useState<Map<string, Message[]>>(new Map());

  useEffect(() => {
    const newMap = new Map<string, Message[]>();
    messages.forEach((message) => {
      const date = message.createdAt.toLocaleDateString();
      if (newMap.has(date)) {
        newMap.set(date, [...(newMap.get(date) || []), message]);
      } else {
        newMap.set(date, [message]);
      }
    });
    setDateMap(newMap);
  }, [messages, chatId]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView();
  }, [dateMap]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4 flex flex-col min-h-full">
        {!chatId && (
          <div className="flex-1 flex justify-center items-center">
            <Badge
              variant="secondary"
              className="px-4 py-2 text-sm font-normal"
            >
              Select a chat to start messaging
            </Badge>
          </div>
        )}
        {chatId && dateMap.size === 0 && (
          <div className="flex-1 flex justify-center items-center">
            <Badge
              variant="secondary"
              className="px-4 py-2 text-sm font-normal"
            >
              No messages yet!
            </Badge>
          </div>
        )}
        <div
          data-testid="MessageList"
          className={"flex flex-col gap-2 mt-auto"}
        >
          {Array.from(dateMap.keys()).map((el) => (
            <React.Fragment key={el}>
              <div className="flex justify-center mb-2 mt-4">
                <Badge
                  variant="secondary"
                  className="px-3 py-1 text-xs font-normal"
                >
                  {el}
                </Badge>
              </div>
              {dateMap.get(el)?.map((el) => (
                <MessageItem key={el.id} id={el.id} createdAt={el.createdAt}>
                  {el.content}
                </MessageItem>
              ))}
            </React.Fragment>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}
