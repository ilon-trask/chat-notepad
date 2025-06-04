import React, { useEffect, useState, useRef } from "react";

function useIsDragging(
  ref: React.RefObject<HTMLDivElement>,
  onFilesDrop: (files: FileList | undefined) => void
) {
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragCounter.current++;
      if (dragCounter.current === 1) {
          setIsDragging(true);
        }
    };
    
    const handleDragLeave = (e: DragEvent) => {
        e.preventDefault();
      dragCounter.current--;
      if (dragCounter.current === 0) {
        setIsDragging(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      dragCounter.current = 0;
      setIsDragging(false);

      const files = e.dataTransfer?.files;
      if (files && files.length > 0 && onFilesDrop) {
        onFilesDrop(files);
      }
    };

    const element = ref.current;
    if (element) {
      element.addEventListener("dragenter", handleDragEnter);
      element.addEventListener("dragleave", handleDragLeave);
      element.addEventListener("dragover", handleDragOver);
      element.addEventListener("drop", handleDrop);

      return () => {
        element.removeEventListener("dragenter", handleDragEnter);
        element.removeEventListener("dragleave", handleDragLeave);
        element.removeEventListener("dragover", handleDragOver);
        element.removeEventListener("drop", handleDrop);
      };
    }
  }, [onFilesDrop]);
  return isDragging;
}

export default useIsDragging;
