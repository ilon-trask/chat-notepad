"use client";
import React, {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from "react";

import ChatService from "@/data/chatService";
import MessageService from "@/data/messageService";
import DeleteService from "@/data/deleteService";
import { FileService } from "@/data/fileService";
import { useMessageStore } from "@/store/messageStore";
import { useChatStore } from "@/store/chatStore";
import { convex } from "@/components/ConvexClientProvider";
import isOnline from "@/helpers/isOnline";
import { RemoteDBService } from "@/data/remoteDBService";
import { createLocalDB } from "@/data/createLocalDB";
import { LocalDBService } from "@/data/localDBService";
import syncServerClientData from "@/data/syncServerClientData";

type NullableServicesContextType = {
  [K in keyof ServicesContextType]: ServicesContextType[K] | null;
};

type Return = NullableServicesContextType;

const remoteDBService = new RemoteDBService(convex);

export default function useServices(): Return {
  const [services, setServices] = useState<Return>({
    chatService: null,
    messageService: null,
    deleteService: null,
    fileService: null,
  });

  const messageStore = useMessageStore();
  const chatStore = useChatStore();

  useEffect(() => {
    const localDB = createLocalDB();
    const localDBService = new LocalDBService(localDB);
    const deleteService = new DeleteService(localDBService);
    const fileService = new FileService(
      localDBService,
      remoteDBService,
      deleteService
    );
    const messageService = new MessageService(
      messageStore,
      isOnline,
      localDBService,
      remoteDBService,
      deleteService,
      fileService
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
      fileService,
    });
    syncServerClientData({
      messageService,
      chatService,
      deleteService,
      fileService,
    });
  }, []);

  return services;
}

interface ServicesContextType {
  chatService: ChatService;
  messageService: MessageService;
  deleteService: DeleteService;
  fileService: FileService;
}

const ServiceContext = createContext<ServicesContextType | null>(null);

interface ServiceProviderProps {
  children: ReactNode;
}

export const ServiceProvider = ({ children }: ServiceProviderProps) => {
  const services = useServices();

  if (Object.values(services).some((service) => !service))
    return <div>Loading services...</div>;

  return (
    <ServiceContext.Provider value={services as ServicesContextType}>
      {children}
    </ServiceContext.Provider>
  );
};

export const useServicesContext = (): ServicesContextType => {
  const context = useContext(ServiceContext);
  if (!context)
    throw new Error("useServices must be used within ServiceProvider");
  return context;
};
