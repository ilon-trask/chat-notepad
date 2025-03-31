import { Search } from "lucide-react";
import { Input } from "../ui/input";
import { SizeVariant } from "@/types/sizeVariant";
import MenuSheet from "./MenuSheet";
import useCommandStore from "@/store/commandStore";

export default function SidebarHeader({ variant }: { variant: SizeVariant }) {
  const commandStore = useCommandStore();

  return (
    <div className="flex items-center justify-center">
      <MenuSheet />
      {variant === "regular" ? (
        <div
          className="p-4 pl-0 border-b border-sidebar-border relative h-[73px] grow"
          onClick={(e) => {
            e.preventDefault();
            commandStore.setIsOpen(true);
          }}
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search"
            className="pl-9 bg-sidebar-accent rounded-full w-full"
          />
        </div>
      ) : null}
    </div>
  );
}
