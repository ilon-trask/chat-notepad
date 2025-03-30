import {
  Menu,
  Moon,
  Sun,
  Monitor,
  Check,
  Search,
  Keyboard,
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

export default function MenuSheet() {
  const { setTheme, theme } = useTheme();

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
            <h3 className="mb-2 text-sm font-medium">Appearance</h3>
            <div className="mb-2 text-xs text-muted-foreground">
              Choose your preferred theme mode
            </div>
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
            <h3 className="mb-2 text-sm font-medium">Keyboard Shortcuts</h3>
            <div className="mb-2 text-xs text-muted-foreground">
              Useful shortcuts to improve your workflow
            </div>
            <div className="rounded-md border">
              <div className="flex items-center justify-between p-3 border-b">
                <div className="flex items-center">
                  <Search className="mr-2 h-4 w-4" />
                  <span className="text-sm">Command Palette</span>
                </div>
                <kbd className="px-2 py-1 text-xs bg-muted rounded">⌘K</kbd>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
