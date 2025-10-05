import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function useDynamicChatId() {
    const pathname = usePathname();
    const [chatId, setChatId] = useState<string>(pathname.split('/')[1]);

    useEffect(() => {
        setChatId(pathname.split('/')[1]);
    }, [pathname]);

    return chatId
}