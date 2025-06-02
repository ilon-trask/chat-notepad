import { useChatDialogStore } from "@/store/chatDialogStore";
import { useChatStore } from "@/store/chatStore";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Plus } from "lucide-react";
import { SizeVariant } from "@/types/sizeVariant.types";
import { useServicesContext } from "../ServicesProvider";

type ChatFormData = {
  name: string;
};

export default function CreateChatDialog({
  variant,
}: {
  variant: SizeVariant;
}) {
  const { chatService } = useServicesContext();
  const chatStore = useChatStore();
  const chatDialogStore = useChatDialogStore();

  const chat = chatStore.getChatById(chatDialogStore.chatId);

  const { register, handleSubmit, setValue } = useForm<ChatFormData>();

  const onSubmit = async (data: ChatFormData) => {
    if (chatDialogStore.isUpdate) {
      chatService.updateChat({
        id: chatDialogStore.chatId,
        name: data.name,
      });
    } else {
      const newChat = await chatService.createChat(data.name);
      chatStore.setChosenChatId(newChat.id);
    }
    chatDialogStore.setIsOpen(false);
  };

  useEffect(() => {
    if (chatDialogStore.isUpdate) {
      setValue("name", chat?.name || "");
    }
  }, [chatDialogStore.isUpdate, chat?.name, setValue]);

  return (
    <Dialog
      open={chatDialogStore.isOpen}
      onOpenChange={(e) => {
        chatDialogStore.setIsOpen(e);
      }}
    >
      <DialogTrigger asChild>
        <Button
          data-testid="CreateChatButton"
          variant="ghost"
          size={"default"}
          className="px-4 w-full justify-start h-10 border-b-gray-200 border-1 rounded-none"
        >
          {variant === "regular" ? (
            <>
              <Plus />
              Add chat
            </>
          ) : (
            <div className="grow flex items-center justify-center">
              <Plus />
            </div>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent data-testid="CreateChatDialogContent">
        <DialogHeader>
          <DialogTitle>Create Chat</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            data-testid="CreateChatDialogInput"
            placeholder="Chat name"
            {...register("name")}
          />
          <DialogFooter>
            <Button data-testid="CreateChatDialogButton" type="submit">
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
