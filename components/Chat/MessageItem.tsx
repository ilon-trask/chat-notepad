import { useMessageInputStore } from "@/store/messageInputStore";
import { useMessageStore } from "@/store/messageStore";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../ui/context-menu";
import { Edit, Trash2 } from "lucide-react";
import { Card } from "../ui/card";
import confirmableDelete from "@/helpers/confirmableDelete";
import { cn } from "@/lib/utils";
import { Message } from "@/types/message.types";
import { Pre } from "../Typography";
import { useServicesContext } from "../ServicesProvider";
import { useEffect, useState } from "react";
import { FileType } from "@/types/file.types";

export default function MessageItem({
  children,
  className,
  id,
  createdAt,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  id: string;
  createdAt: Date;
}) {
  const { messageService, fileService } = useServicesContext();
  const messageStore = useMessageStore();
  const messageInputStore = useMessageInputStore();

  const handleEdit = () => {
    //timeout to prevent menu stealing focus form message input
    setTimeout(() => {
      messageInputStore.startEditing(id, children as string, files);
    }, 200);
  };

  const [files, setFiles] = useState<FileType[]>([]);

  useEffect(() => {
    (async () => {
      const newFiels = await fileService.getMessageFiles(id);
      console.log("files", newFiels);
      if (
        newFiels
          .map((el) => el.name)
          .sort()
          .toString() !=
        files
          .map((el) => el.name)
          .sort()
          .toString()
      )
        setFiles(newFiels);
    })();
  });

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <Card
          className={cn(
            "p-3 rounded-lg max-w-[70%] self-start gap-2",
            className
          )}
          {...props}
        >
          <div className="flex flex-col">
            {files.map((el) => (
              <img
                alt=""
                key={el.id}
                src={(() => URL.createObjectURL(el.file))()}
              />
            ))}
            <Pre className="break-words">{children}</Pre>
            <div className="text-xs text-gray-500 text-right text-[10px] mt-1 self-end">
              {new Date(createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        </Card>
      </ContextMenuTrigger>
      <ContextMenuContent data-testid="MessageDropdownMenu">
        <ContextMenuItem data-testid="MessageEditButton" onClick={handleEdit}>
          <Edit className="mr-2 h-4 w-4" />
          <span>Edit</span>
        </ContextMenuItem>
        <ContextMenuItem
          data-testid="MessageDeleteButton"
          className="text-destructive"
          onClick={() => {
            confirmableDelete<Message>({
              getEntity: () => messageStore.getMessageById(id),
              onDelete: () => messageService.deleteMessage(id),
              onStoreDelete: () => messageStore.deleteMessage(id),
              onReverseDelete: (message: Message) =>
                messageStore.addMessage(message),
              name: "Message",
            });
          }}
        >
          <Trash2 className="mr-2 h-4 w-4 text-destructive" />
          <span>Delete</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
