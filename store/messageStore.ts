import { Message } from "@/types/message.types";
import { create } from "zustand";

export type MessageStore = {
  messages: Message[];
  getMessages: (chatId: string) => Message[];
  getMessageById: (messageId: string) => Message;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  deleteMessage: (messageId: string) => void;
  updateMessage: (message: Message) => void;
};

export const useMessageStore = create<MessageStore>((set,) => ({
  messages: [],
  getMessages: (chatId: string): Message[] => {
    return useMessageStore.getState().messages.filter(
      (message: Message) => message.chatId === chatId
    ).toSorted((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  },
  getMessageById: (messageId: string): Message => {
    const message = useMessageStore.getState().messages.find(
      (message: Message) => message.id === messageId
    );
    if (!message) {
      throw new Error("Message not found");
    }
    return message;
  },
  setMessages: (messages: Message[]) => set({ messages }),
  addMessage: (message: Message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  deleteMessage: (messageId: string) =>
    set((state) => ({
      ...state,
      messages: state.messages.filter((el) => el.id != messageId),
    })),
  updateMessage: (message: Message) =>
    set((state) => ({
      ...state,
      messages: state.messages.map((el) =>
        el.id == message.id ? message : el
      ),
    })),
}));
