import { Search } from "lucide-react";
import { Input } from "../ui/input";
import { SizeVariant } from "@/types/sizeVariant";
import MenuSheet from "./MenuSheet";

export default function SidebarHeader({ variant }: { variant: SizeVariant }) {
  return (
    <div className="flex items-center justify-center">
      <MenuSheet />
      {variant === "regular" ? (
        <div className="p-4 pl-0 border-b border-sidebar-border relative h-[73px] grow">
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
