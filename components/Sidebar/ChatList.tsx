"use client";
import CreateChatDialog from "./CreateChatDialog";
import ChatItem from "./ChatItem";
import { SizeVariant } from "@/types/sizeVariant";
import useChats from "@/data/useChats";
import { useDynamicChatId } from "@/hooks/useDynamicChatId";

export default function ChatList({ variant }: { variant: SizeVariant }) {
  const chatId = useDynamicChatId();
  const { chats } = useChats();

  return (
    <div data-testid="ChatList" className="overflow-y-auto no-scrollbar">
      <CreateChatDialog variant={variant} />
      {chats.map(({ id, ...el }) => (
        <ChatItem
          key={id}
          id={id}
          name={el.name}
          lastMessage="Last message preview..."
          isActive={chatId === id}
          variant={variant}
        />
      ))}
    </div>
  );
}
