import { create } from "zustand";

export type ChatDialogStore = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isUpdate: boolean;
  setIsUpdate: (isUpdate: boolean) => void;
  chatId: string;
  setChatId: (chatId: string) => void;
};

export const useChatDialogStore = create<ChatDialogStore>((set) => ({
  isOpen: false,
  setIsOpen: (isOpen: boolean) => {
    if (isOpen) {
      set({ isOpen });
    } else {
      set({ isOpen, isUpdate: false, chatId: "" });
    }
  },
  isUpdate: false,
  setIsUpdate: (isUpdate: boolean) => set({ isUpdate }),
  chatId: "",
  setChatId: (chatId: string) => set({ chatId }),
}));
