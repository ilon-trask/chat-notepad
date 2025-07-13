import { useMessageInputStore } from "@/store/messageInputStore";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../ui/context-menu";
import { Edit, Trash2 } from "lucide-react";
import { Card } from "../ui/card";
import { cn } from "@/lib/utils";
import { Pre } from "../Typography";
import { useEffect, useState } from "react";
import { LocalFileType } from "@/types/file.types";
import { useServicesContext } from "../ServicesProvider";

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
  const messageInputStore = useMessageInputStore();
  const { fileService, messageService } = useServicesContext();

  const handleEdit = () => {
    //timeout to prevent menu stealing focus form message input
    setTimeout(() => {
      messageInputStore.startEditing(id, children as string, files);
    }, 200);
  };

  const [files, setFiles] = useState<LocalFileType[]>([]);

  useEffect(() => {
    (async () => {
      const newFiels = (await fileService.getAll()).filter(
        (el) => el.messageId == id
      );
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
            messageService.delete(id);
          }}
        >
          <Trash2 className="mr-2 h-4 w-4 text-destructive" />
          <span>Delete</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
