import { useEffect, useState } from "react";
import { createLocalDB } from "./createLocalDB";
import ChatService from "./chatService";
import MessageService from "./messageService";
import { useMessageStore } from "@/store/messageStore";
import { useChatStore } from "@/store/chatStore";
import syncServerClientData from "./syncServerClientData";
import { convex } from "@/components/ConvexClientProvider";
import isOnline from "@/helpers/isOnline";
import { LocalDBService } from "./localDBService";
import { RemoteDBService } from "./remoteDBService";
import DeleteService from "./deleteService";

type Return = {
  chatService: ChatService | null;
  messageService: MessageService | null;
  deleteService: DeleteService | null;
};

const remoteDBService = new RemoteDBService(convex);

export default function useServices(): Return {
  const [services, setServices] = useState<Return>({
    chatService: null,
    messageService: null,
    deleteService: null,
  });

  const messageStore = useMessageStore();
  const chatStore = useChatStore();

  useEffect(() => {
      const localDB = createLocalDB();
      const localDBService = new LocalDBService(localDB);
      const deleteService = new DeleteService(localDBService);
      const messageService = new MessageService(
        messageStore,
        isOnline,
        localDBService,
        remoteDBService,
        deleteService
      );
      const chatService = new ChatService(
        messageService,
        chatStore,
        isOnline,
        localDBService,
        remoteDBService,
        deleteService
      );
      setServices({
        chatService,
        deleteService,
        messageService,
      });
      syncServerClientData(messageService, chatService, deleteService);
  }, []);

  return services;
}
