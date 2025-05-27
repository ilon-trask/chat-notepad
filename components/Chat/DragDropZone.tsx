import React, { useRef } from "react";
import { cn } from "@/lib/utils";
import useIsDragging from "@/hooks/useIsDragging";

interface DragDropZoneProps {
  children: React.ReactNode;
  onFilesDrop?: (files: FileList) => void;
  className?: string;
}

function DragDropZone({ children, onFilesDrop, className }: DragDropZoneProps) {
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const isDragging = useIsDragging(dropZoneRef, onFilesDrop);

  const handleBrowseClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && onFilesDrop) {
        onFilesDrop(files);
      }
    };
    input.click();
  };

  const renderDropZoneContent = () => {
    if (isDragging) {
      return (
        <div className="absolute -z-1 inset-0 flex flex-col bg-secondary items-center justify-center rounded-lg border-2 border-dashed border-blue-500">
          <p>Release to upload files</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={cn("relative w-full h-full", className)} ref={dropZoneRef}>
      {children}
      {renderDropZoneContent()}
    </div>
  );
}

export default DragDropZone;
