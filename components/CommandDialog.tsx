"use client";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useChatStore } from "@/store/chatStore";
import useCommandStore from "@/store/commandStore";
import { useEffect } from "react";

export default function CommandMenu() {
  const commandStore = useCommandStore();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        commandStore.setIsOpen(!commandStore.isOpen);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const chatStore = useChatStore();

  return (
    <CommandDialog
      open={commandStore.isOpen}
      onOpenChange={commandStore.setIsOpen}
    >
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Chats">
          {chatStore.getChats().map((el) => (
            <CommandItem
              key={el.id}
              onSelect={() => {
                chatStore.setChosenChatId(el.id);
                commandStore.setIsOpen(false);
              }}
            >
              {el.name}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
