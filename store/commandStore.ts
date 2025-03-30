import { create } from "zustand";

interface CommandStore {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const useCommandStore = create<CommandStore>((set) => ({
  isOpen: false,
  setIsOpen: (open) => set({ isOpen: open }),
}));

export default useCommandStore;
