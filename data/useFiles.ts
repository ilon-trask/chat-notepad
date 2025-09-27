import { useMemo } from "react";
import useUIStore from "./UIStore";

function useFiles() {
    const UIStore = useUIStore();

    const files = UIStore.getAll()
        .filter((el) => el.type == "file")
        .sort((a, b) => a.createdAt.valueOf() - b.createdAt.valueOf());

    const getFilesByMessageId = (messageId: string) => {
        return useMemo(() => {
            return files.filter((el) => el.messageId === messageId);
        }, [messageId, files]);
    };

    return { files, getFilesByMessageId };
}

export default useFiles;
