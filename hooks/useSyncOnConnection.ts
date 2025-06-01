import { useServicesContext } from '@/components/ServicesProvider';
import syncServerClientData from '@/data/syncServerClientData';
import { useEffect } from 'react'

export default function useSyncOnConnection() {
  const { chatService, messageService, deleteService } = useServicesContext();

  useEffect(() => {
    // const offlineFunc = () => {
    // };

    // window.addEventListener("offline", offlineFunc);

    const onlineFunc = () => {
      syncServerClientData(messageService, chatService, deleteService);
    };

    window.addEventListener("online", onlineFunc);
    return () => {
      // window.removeEventListener("offline", offlineFunc);
      window.removeEventListener("online", onlineFunc);
    };
  }, []);
}
