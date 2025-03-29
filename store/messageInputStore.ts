import { create } from "zustand";

export type MessageInputStore = {
  message: string;
  setMessage: (message: string) => void;
  isUpdate: boolean;
  setIsUpdate: (isUpdate: boolean) => void;
  messageId: string;
  setMessageId: (messageId: string) => void;
  startEditing: (messageId: string, messageText: string) => void;
  cancelEditing: () => void;
};

export const useMessageInputStore = create<MessageInputStore>((set) => ({
  message: "",
  isUpdate: false,
  messageId: "",
  setMessage: (message: string) => set({ message }),
  setIsUpdate: (isUpdate: boolean) => set({ isUpdate }),
  setMessageId: (messageId: string) => set({ messageId }),
  startEditing: (messageId: string, messageText: string) => 
    set({ 
      messageId, 
      message: messageText, 
      isUpdate: true 
    }),
  cancelEditing: () => 
    set({ 
      messageId: "", 
      message: "", 
      isUpdate: false 
    }),
}));
