"use client";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useChatDialogStore } from "@/store/chatDialogStore";
import useCommandStore from "@/store/commandStore";
import { useMessageInputStore } from "@/store/messageInputStore";
import { useEffect } from "react";
import { useServicesContext } from "./ServicesProvider";
import useChats from "@/data/useChats";
import { useDynamicChatId } from "@/hooks/useDynamicChatId";
import { CHAT_LABEL } from "@/constants/labels";

export default function CommandMenu() {
  const commandStore = useCommandStore();
  const chatId = useDynamicChatId();
  const chatDialogStore = useChatDialogStore();
  const { chatService } = useServicesContext();
  const messageInputStore = useMessageInputStore();
  const { chats } = useChats();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "л") && (e.metaKey || e.ctrlKey)) {
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
      <CommandList data-testid="CommandDialogList">
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Actions">
          <CommandItem
            data-testid="CommandDialogCreateChat"
            onSelect={() => {
              chatDialogStore.setIsOpen(true);
              commandStore.setIsOpen(false);
            }}
          >
            Add new chat
          </CommandItem>
          {chatId && (
            <>
              <CommandItem
                onSelect={() => {
                  chatDialogStore.startEditing(chatId);
                  commandStore.setIsOpen(false);
                }}
              >
                Edit current chat
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  chatService.delete(chatId, CHAT_LABEL);
                  commandStore.setIsOpen(false);
                }}
              >
                Delete current chat
              </CommandItem>
            </>
          )}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Chats">
          {chats.map((el) => (
            <CommandItem
              key={el.id}
              onSelect={() => {
                window.history.pushState({}, "", `/${el.id}`);
                commandStore.setIsOpen(false);
                messageInputStore.startFocus();
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
