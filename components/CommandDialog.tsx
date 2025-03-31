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
import { useDBContext } from "@/contexts/dbContext";
import confirmableChatDelete from "@/helpers/comfirmableChatDelete";
import { useChatDialogStore } from "@/store/chatDialogStore";
import { useChatStore } from "@/store/chatStore";
import useCommandStore from "@/store/commandStore";
import { useMessageInputStore } from "@/store/messageInputStore";
import { useMessageStore } from "@/store/messageStore";
import { useEffect } from "react";

export default function CommandMenu() {
  const commandStore = useCommandStore();
  const chatStore = useChatStore();
  const chatDialogStore = useChatDialogStore();
  const db = useDBContext();
  const messageStore = useMessageStore();
  const messageInputStore = useMessageInputStore();

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
                messageInputStore.startFocus();
              }}
            >
              {el.name}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem
            onSelect={() => {
              chatDialogStore.setIsOpen(true);
              commandStore.setIsOpen(false);
            }}
          >
            Add new chat
          </CommandItem>
          {chatStore.chosenChatId && (
            <>
              <CommandItem
                onSelect={() => {
                  chatDialogStore.startEditing(chatStore.chosenChatId);
                  commandStore.setIsOpen(false);
                }}
              >
                Edit current chat
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  confirmableChatDelete(db, chatStore, messageStore, chatStore.chosenChatId);
                  commandStore.setIsOpen(false);
                }}
              >
                Delete current chat
              </CommandItem>
            </>
          )}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
