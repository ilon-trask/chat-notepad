import previewFileUploadHandler from "@/data/fileUploadHandler";
import { useDynamicChatId } from "@/hooks/useDynamicChatId";
import useIsDragging from "@/hooks/useIsDragging";
import { cn } from "@/lib/utils";
import { useMessageInputStore } from "@/store/messageInputStore";
import React, {
  createContext,
  useContext,
  ReactNode,
  useRef,
  RefObject,
} from "react";

interface DragAndDropContextType {
  isDragging: boolean;
}

const DragAndDropContext = createContext<DragAndDropContextType | undefined>(
  undefined
);

interface DragAndDropProviderProps {
  children: ReactNode;
  className: string;
}

export function DragAndDropProvider({
  children,
  className,
}: DragAndDropProviderProps) {
  const chosenChatId = useDynamicChatId();

  const dragZoneRef = useRef<HTMLDivElement>(null);

  const messageInputStore = useMessageInputStore();

  const uploadFile = (files: FileList | undefined) => {
    if (chosenChatId) return previewFileUploadHandler(files, messageInputStore);
  };

  const isDragging = useIsDragging(
    dragZoneRef as RefObject<HTMLDivElement>,
    uploadFile
  );

  const value = { isDragging };

  const RenderDropZoneContent = () => {
    if (isDragging && chosenChatId) {
      return (
        <div className="absolute z-10 inset-0 flex flex-col bg-secondary items-center justify-center rounded-lg border-2 border-dashed border-blue-500">
          <p>Release to upload files</p>
        </div>
      );
    }
    return null;
  };

  return (
    <DragAndDropContext.Provider value={value}>
      <div ref={dragZoneRef} className={cn(className, "relative z-20")}>
        {children}
        {RenderDropZoneContent()}
      </div>
    </DragAndDropContext.Provider>
  );
}

export function useDragAndDrop() {
  const context = useContext(DragAndDropContext);
  if (context === undefined) {
    throw new Error("useDragAndDrop must be used within a DragAndDropProvider");
  }
  return context;
}
