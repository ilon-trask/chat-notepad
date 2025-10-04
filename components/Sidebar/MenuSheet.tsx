"use client";
import {
  Menu,
  Moon,
  Sun,
  Monitor,
  Check,
  Search,
  RefreshCw,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { useTheme } from "next-themes";
import { Muted, Large } from "../Typography";
import { LocalDBService } from "@/data/localDB/localDBService";
import { DATA_LABEL } from "@/data/localDB/createLocalDB";
import { Data } from "@/types/data/data";
import { LocalChange } from "@/types/change";
import { CHANGE_LABEL } from "@/constants/labels";
import useUIStore from "@/data/UIStore";

export default function MenuSheet() {
  const { setTheme, theme } = useTheme();
  const UIstore = useUIStore();
  return (
    <Sheet>
      <SheetTrigger>
        <div className="p-6 flex items-center justify-center cursor-pointer">
          <Menu />
        </div>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>
            Configure your application preferences
          </SheetDescription>
        </SheetHeader>
        <div className="p-4">
          <div className="py-4">
            <Large className="mb-2 ">Appearance</Large>
            <Muted className="mb-2">Choose your preferred theme mode</Muted>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <div className="flex items-center">
                    {theme === "light" && <Sun className="mr-2 h-4 w-4" />}
                    {theme === "dark" && <Moon className="mr-2 h-4 w-4" />}
                    {theme === "system" && <Monitor className="mr-2 h-4 w-4" />}
                    {theme === "light" && "Light Mode"}
                    {theme === "dark" && "Dark Mode"}
                    {theme === "system" && "System Preferences"}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[240px]">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  <Sun className="mr-2 h-4 w-4" />
                  Light Mode
                  {theme === "light" && <Check className="ml-auto h-4 w-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  <Moon className="mr-2 h-4 w-4" />
                  Dark Mode
                  {theme === "dark" && <Check className="ml-auto h-4 w-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  <Monitor className="mr-2 h-4 w-4" />
                  System Preferences
                  {theme === "system" && <Check className="ml-auto h-4 w-4" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="py-4">
            <Large className="mb-2">Data</Large>
            <Muted className="mb-2">
              Revalidate local data with the server
            </Muted>
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={async () => {
                console.log("refresh");
                const dataDb = new LocalDBService<Data>(DATA_LABEL);
                const changeDb = new LocalDBService<LocalChange>(CHANGE_LABEL);
                await dataDb.clearAll();
                await changeDb.clearAll();
                UIstore.set([]);
                window.location.reload();
              }}
            >
              <div className="flex items-center">
                <RefreshCw className="mr-2 h-4 w-4" />
                Revalidate Data
              </div>
            </Button>
          </div>

          {/* <div className="py-4">
            <div className="flex items-center gap-4">
              <Switch
                checked={settings.privateMode}
                onCheckedChange={() => {
                  setSettings({
                    ...settings,
                    privateMode: !settings.privateMode,
                  });
                }}
              />
              <div>
                <Large className="mb-2">Private mode</Large>
                <Muted className="mb-2">
                  All your data will be stored locally
                </Muted>
              </div>
            </div>
          </div> */}

          <div className="py-4">
            <Large className="mb-2">Keyboard Shortcuts</Large>
            <Muted className="mb-2">
              Useful shortcuts to improve your workflow
            </Muted>
            <div className="rounded-md border">
              <div className="flex items-center justify-between p-3 border-b">
                <div className="flex items-center">
                  <Search className="mr-2 h-4 w-4" />
                  <span className="text-sm">Command Palette</span>
                </div>
                <kbd className="px-2 py-1 text-xs bg-muted rounded">⌘ + K</kbd>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
