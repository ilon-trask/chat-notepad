import { create } from "zustand";

export type MessageInputStore = {
  toFocus: {};
  startFocus: () => void;
  message: string;
  setMessage: (message: string) => void;
  isUpdate: boolean;
  setIsUpdate: (isUpdate: boolean) => void;
  messageId: string;
  setMessageId: (messageId: string) => void;
  startEditing: (messageId: string, messageText: string) => void;
  cancelEditing: () => void;
  fileUpload: File[];
  setFileUpload: (file: File[]) => void;
};

export const useMessageInputStore = create<MessageInputStore>((set) => ({
  toFocus: {},
  message: "",
  isUpdate: false,
  messageId: "",
  startFocus: () => set({ toFocus: {} }),
  setMessage: (message: string) => set({ message }),
  setIsUpdate: (isUpdate: boolean) => set({ isUpdate }),
  setMessageId: (messageId: string) => set({ messageId }),
  startEditing: (messageId: string, messageText: string) =>
    set({
      messageId,
      message: messageText,
      isUpdate: true,
    }),
  cancelEditing: () =>
    set({
      messageId: "",
      message: "",
      isUpdate: false,
    }),
  fileUpload: [],
  setFileUpload: (file: File[]) => set({ fileUpload: file }),
}));
