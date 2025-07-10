import { useServicesContext } from "@/components/ServicesProvider";
import syncEngine from "@/data/syncEngine";
import syncServerClientData from "@/data/syncServerClientData";
import { useEffect } from "react";

export default function useSync() {
  const services = useServicesContext();
  useEffect(() => {
    // const offlineFunc = () => {
    // };

    // window.addEventListener("offline", offlineFunc);

    const onlineFunc = () => {
      syncServerClientData(services);
    };
    syncEngine(
      services.messageService,
      services.chatService,
      services.fileService
    );
    window.addEventListener("online", onlineFunc);
    return () => {
      // window.removeEventListener("offline", offlineFunc);
      window.removeEventListener("online", onlineFunc);
    };
  }, []);
}
