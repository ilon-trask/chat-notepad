import { Search } from "lucide-react";
import { Input } from "../ui/input";
import { SizeVariant } from "@/types/sizeVariant.types";
import MenuSheet from "./MenuSheet";
import useCommandStore from "@/store/commandStore";

export default function SidebarHeader({ variant }: { variant: SizeVariant }) {
  const commandStore = useCommandStore();

  return (
    <div className="flex items-center justify-center">
      <MenuSheet />
      {variant === "regular" ? (
        <div
          className="p-4 pl-0 border-sidebar-border relative grow"
          onClick={(e) => {
            e.preventDefault();
            commandStore.setIsOpen(true);
          }}
        >
          <div className="w-full flex items-center relative">
            <Search className="h-4 w-4 text-muted-foreground absolute left-3 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search"
              className="bg-sidebar-accent rounded-full w-full pl-9"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
