import { LocalFileType } from "@/types/file.types";
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
  startEditing: (
    messageId: string,
    messageText: string,
    files: LocalFileType[]
  ) => void;
  cancelEditing: () => void;
  fileUpload: LocalFileType[];
  setFileUpload: (file: LocalFileType[]) => void;
  addFileUpload: (file: LocalFileType) => void;
  removeFileUpload: (id: string) => void;
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
  startEditing: (messageId: string, messageText: string, files: LocalFileType[]) =>
    set({
      messageId,
      message: messageText,
      isUpdate: true,
      fileUpload: files,
    }),
  cancelEditing: () =>
    set({
      messageId: "",
      message: "",
      isUpdate: false,
    }),
  fileUpload: [],
  setFileUpload: (file: LocalFileType[]) => set({ fileUpload: file }),
  addFileUpload: (file: LocalFileType) =>
    set((state) => ({ fileUpload: [...state.fileUpload, file] })),
  removeFileUpload: (id: string) =>
    set((state) => ({
      fileUpload: state.fileUpload.filter((el) => el.id !== id),
    })),
}));
