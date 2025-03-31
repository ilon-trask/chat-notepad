import { Chat } from "@/types/chat";
import confirmableDelete from "./confirmableDelete";
import { ChatStore } from "@/store/chatStore";
import chatService from "@/data/chatService";
import { MessageStore } from "@/store/messageStore";

export default function confirmableChatDelete(
  db: IDBDatabase,
  chatStore: ChatStore,
  messageStore: MessageStore,
  id: string
) {
  confirmableDelete<Chat>({
    getEntity: () => chatStore.getChatById(id),
    onDelete: () => chatService.deleteChat(db, chatStore, messageStore, id),
    onStoreDelete: () => chatStore.deleteChat(id),
    onReverseDelete: (chat: Chat) => chatStore.addChat(chat),
    name: "Chat",
  });
}
