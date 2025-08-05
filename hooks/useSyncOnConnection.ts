import { useServicesContext } from "@/components/ServicesProvider";
import { useEffect } from "react";

export default function useSync() {
  const services = useServicesContext();
  useEffect(() => {
    // const offlineFunc = () => {
    // };

    // window.addEventListener("offline", offlineFunc);

    const onlineFunc = () => {
      // syncServerClientData(services);
    };

    window.addEventListener("online", onlineFunc);
    return () => {
      // window.removeEventListener("offline", offlineFunc);
      window.removeEventListener("online", onlineFunc);
    };
  }, []);
}
