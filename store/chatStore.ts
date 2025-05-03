import { Chat } from "@/types/chat.types";
import { create } from "zustand";

export type ChatStore = {
  chosenChatId: string;
  chats: Chat[];
  getChats: () => Chat[];
  getChatById: (chatId: string) => Chat | undefined;
  setChosenChatId: (chatId: string) => void;
  setChats: (chats: Chat[]) => void;
  addChat: (chat: Chat) => void;
  deleteChat: (chatId: string) => void;
  updateChat: (chat: Chat) => void;
};

export const useChatStore = create<ChatStore>((set) => ({
  chosenChatId: "",
  chats: [],
  getChats: (): Chat[] =>
    useChatStore
      .getState()
      .chats.toSorted((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
  getChatById: (chatId: string): Chat | undefined =>
    useChatStore.getState().chats.find((el) => el.id == chatId),
  setChosenChatId: (chatId: string) => set({ chosenChatId: chatId }),
  setChats: (chats: Chat[]) => set({ chats }),
  addChat: (chat: Chat) => set((state) => ({ chats: [...state.chats, chat] })),
  deleteChat: (chatId: string) =>
    set((state) => ({
      ...state,
      chats: state.chats.filter((el) => el.id != chatId),
    })),
  updateChat: (chat: Chat) =>
    set((state) => ({
      ...state,
      chats: state.chats.map((el) => (el.id == chat.id ? chat : el)),
    })),
}));
