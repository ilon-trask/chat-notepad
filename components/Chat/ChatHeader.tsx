import React from "react";
import { Large } from "../Typography";
import useIsMobile from "@/hooks/useIsMobile";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";
import useChats from "@/data/useChats";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";

export default function ChatHeader() {
  const params = useParams();
  const chatId = params.chatId as string;
  const router = useRouter();
  const chat = useChats().getChatById(chatId);
  const isMobile = useIsMobile();

  return (
    <div className="h-[73px]  border-b border-gray-200 dark:border-gray-800 px-4 flex items-center justify-between">
      {isMobile ? (
        <div className="flex items-center gap-2">
          <Button
            className="min-w-fit"
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
          >
            <ArrowLeft /> Back
          </Button>
        </div>
      ) : null}
      <Large>{chat?.name || "Select a chat"}</Large>
    </div>
  );
}
