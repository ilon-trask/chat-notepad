import { Loader2, X } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";

function FileBubble({ file }: { file: File }) {
  return (
    <div
      key={file.name}
      className="flex items-center gap-2 bg-background/50 rounded-full px-3 py-1 text-sm"
    >
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="truncate max-w-[200px]">{file.name}</span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0"
        // onClick={() => messageInputStore.removeFileUpload(el.id)}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default FileBubble;
