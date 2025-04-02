import chatService from "@/data/chatService";
import { useChatStore } from "@/store/chatStore";
import { useEffect } from "react";
import CreateChatDialog from "./CreateChatDialog";
import ChatItem from "./ChatItem";
import { SizeVariant } from "@/types/sizeVariant";

export default function ChatList({ variant }: { variant: SizeVariant }) {
  const chatStore = useChatStore();

  useEffect(() => {
    chatService.getAllChats(chatStore);
  }, []);

  return (
    <div
      data-testid="ChatList"
      className="overflow-y-auto h-[calc(100vh-73px)] no-scrollbar"
    >
      <CreateChatDialog variant={variant} />
      {chatStore.getChats().map(({ id, ...el }) => (
        <ChatItem
          key={id}
          id={id}
          name={el.name}
          lastMessage="Last message preview..."
          isActive={chatStore.chosenChatId === id}
          variant={variant}
        />
      ))}
    </div>
  );
}
