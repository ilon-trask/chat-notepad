import { useServicesContext } from "@/components/ServicesProvider";
import syncServerClientData from "@/data/syncServerClientData";
import { useEffect } from "react";

export default function useSyncOnConnection() {
  const services = useServicesContext();

  useEffect(() => {
    // const offlineFunc = () => {
    // };

    // window.addEventListener("offline", offlineFunc);

    const onlineFunc = () => {
      syncServerClientData(services);
    };

    window.addEventListener("online", onlineFunc);
    return () => {
      // window.removeEventListener("offline", offlineFunc);
      window.removeEventListener("online", onlineFunc);
    };
  }, []);
}
