import { X } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
import { LocalFileType } from "@/types/data/file";
import { useMessageInputStore } from "@/store/messageInputStore";

function FileBubble({ file }: { file: LocalFileType }) {
  const messageInputStore = useMessageInputStore();

  return (
    <div
      key={file.name}
      className="flex items-center gap-2 bg-background/50 rounded-sm px-3 py-1 text-sm"
    >
      <div className="flex items-center gap-2">
        <img
          alt=""
          src={(() => URL.createObjectURL(file.file))()}
          width={40}
          height={40}
          className="object-cover rounded-sm aspect-square"
        />
        <span className="truncate max-w-[200px]">{file.name}</span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0"
        onClick={() => {
          messageInputStore.removeFileUpload(file.id);
        }}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default FileBubble;
