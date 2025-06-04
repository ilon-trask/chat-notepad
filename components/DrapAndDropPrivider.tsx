import fileUploadHandler from "@/data/fileUploadHandler";
import useIsDragging from "@/hooks/useIsDragging";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/store/chatStore";
import { useMessageInputStore } from "@/store/messageInputStore";
import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
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
  const dragZoneRef = useRef<HTMLDivElement>(null);

  const messageInputStore = useMessageInputStore();

  const uploadFile = (files: FileList | undefined) => {
    return fileUploadHandler(files, messageInputStore);
  };

  const isDragging = useIsDragging(
    dragZoneRef as RefObject<HTMLDivElement>,
    uploadFile
  );

  const value = { isDragging };

  const renderDropZoneContent = () => {
    const chatId = useChatStore().chosenChatId;

    if (isDragging && chatId) {
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
        {renderDropZoneContent()}
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
