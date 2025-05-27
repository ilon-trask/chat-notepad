import React, { useEffect, useState } from 'react'

function useIsDragging(
    ref: React.RefObject<HTMLDivElement>,
    onFilesDrop?: (files: FileList) => void
) {
    const [isDragging, setIsDragging] = useState(false);

    console.log("isDragging", isDragging);
    useEffect(() => {
        const handleDragOver = (e: DragEvent) => {
            e.preventDefault();
            setIsDragging(true);
        };

        const handleDragLeave = () => {
            setIsDragging(false);
        };

        const handleDrop = (e: DragEvent) => {
            e.preventDefault();
            setIsDragging(false);

            const files = e.dataTransfer?.files;
            if (files && files.length > 0 && onFilesDrop) {
                onFilesDrop(files);
            }
        };

        const element = ref.current;
        if (element) {
            element.addEventListener("dragover", handleDragOver);
            element.addEventListener("dragleave", handleDragLeave);
            element.addEventListener("drop", handleDrop);

            return () => {
                element.removeEventListener("dragover", handleDragOver);
                element.removeEventListener("dragleave", handleDragLeave);
                element.removeEventListener("drop", handleDrop);
            };
        }
    }, []);
    return isDragging
}

export default useIsDragging