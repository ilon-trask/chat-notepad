import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useMessageStore } from "@/store/messageStore";
import { useDBContext } from "@/contexts/DBContext";
import { useChatStore } from "@/store/chatStore";
import { useChatDialogStore } from "@/store/chatDialogStore";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { Edit, MoreVertical, Trash2 } from "lucide-react";
import { SizeVariant } from "@/types/sizeVariant";
import confirmableChatDelete from "@/helpers/comfirmableChatDelete";
import { Muted, Small } from "../Typography";
import useIsMobile from "@/hooks/useIsMobile";

export default function ChatItem({
  type = "button",
  id,
  name,
  lastMessage,
  isActive = false,
  variant,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  id: string;
  name: string;
  lastMessage: string;
  isActive?: boolean;
  variant: SizeVariant;
}) {
  const db = useDBContext();
  const chatStore = useChatStore();
  const messageStore = useMessageStore();
  const chatDialogStore = useChatDialogStore();
  const isMobile = useIsMobile();

  return (
    <div className="relative group">
      <Button
        type={type}
        variant="ghost"
        className={cn(
          "w-full justify-start p-4 rounded-none hover:bg-sidebar-accent",
          "h-auto",
          isActive && "bg-sidebar-accent text-primary border-l-4 border-primary"
        )}
        {...props}
      >
        <div className="flex items-center gap-3 w-full">
          <div
            className={cn(
              "w-12 h-12 bg-sidebar-primary rounded-full shrink-0",
              isActive && "border-2 border-primary"
            )}
          />
          <div className="flex-1 text-left">
            <div className="flex justify-between">
              {variant === "regular" ? <Small>{name}</Small> : null}
            </div>
            {variant === "regular" ? <Muted>{lastMessage}</Muted> : null}
          </div>
        </div>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {isMobile ? (
            <Button
              variant="outline"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => {
              chatDialogStore.startEditing(id);
            }}
          >
            <Edit className="mr-2 h-4 w-4" />
            <span>Edit</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => {
              confirmableChatDelete(db, chatStore, messageStore, id);
            }}
          >
            <Trash2 className="mr-2 h-4 w-4 text-destructive" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
