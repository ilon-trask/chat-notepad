import React, { useEffect, useRef, useState } from "react";
import { useMessageStore } from "@/store/messageStore";
import { useChatStore } from "@/store/chatStore";
import { type Message } from "@/types/message";
import { Badge } from "../ui/badge";
import messageService from "@/data/messageService";
import { useDBContext } from "@/contexts/dbContext";
import MessageItem from "./MessageItem";

export default function MessagesList() {
  const db = useDBContext();
  const messageStore = useMessageStore();
  const chatId = useChatStore().chosenChatId;

  useEffect(() => {
    messageService.getAllMessages(db, messageStore);
  }, []);

  const [dateMap, setDateMap] = useState<Map<string, Message[]>>(new Map());

  useEffect(() => {
    const newMap = new Map<string, Message[]>();
    const messages = messageStore.getMessages(chatId);
    messages.forEach((message) => {
      const date = message.createdAt.toLocaleDateString();
      if (newMap.has(date)) {
        newMap.set(date, [...(newMap.get(date) || []), message]);
      } else {
        newMap.set(date, [message]);
      }
    });
    setDateMap(newMap);
  }, [messageStore, chatId]);

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
        <div className={"flex flex-col gap-2 mt-auto"}>
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
                <MessageItem key={el.id} id={el.id} children={el.content} />
              ))}
            </React.Fragment>
          ))}
          <div ref={messagesEndRef}/>
        </div>
      </div>
    </div>
  );
}
