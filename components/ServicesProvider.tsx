"use client";
import React, {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from "react";
import syncServerClientData from "@/data/syncServerClientData";
import { DeleteLocalDBService } from "@/data/delete/deleteLocalDBService";
import { FileLocalDBService } from "@/data/file/fileLocalDBService";
import { DBService } from "@/data/DBService";
import {
  CHAT_LABEL,
  FILE_LABEL,
  MESSAGE_LABEL,
} from "@/constants/labels";
import { MessageLocalDBService } from "@/data/message/messageLocalDBService";
import { ChatLocalDBService } from "@/data/chat/chatLocalDBService";
import { FileRemoteDBService } from "@/data/file/fileRemoteDBService";
import { MessageRemoteDBService } from "@/data/message/messageRemoteDBService";
import { ChatRemoteDBService } from "@/data/chat/chatRemoteDBService";

type NullableServicesContextType = {
  [K in keyof ServicesContextType]: ServicesContextType[K] | null;
};

type Return = NullableServicesContextType;

export default function useServices(): Return {
  const [services, setServices] = useState<Return>({
    chatService: null,
    messageService: null,
    deleteService: null,
    fileService: null,
  });

  useEffect(() => {
    const deleteService = new DeleteLocalDBService();
    const fileLocalDBService = new FileLocalDBService();
    const fileRemoteDBService = new FileRemoteDBService();
    const fileService = new DBService<typeof FILE_LABEL>(
      fileLocalDBService,
      fileRemoteDBService,
      deleteService,
      FILE_LABEL
    );
    const messageLocalDBService = new MessageLocalDBService(fileLocalDBService);
    const messageRemoteDBService = new MessageRemoteDBService();
    const messageService = new DBService<typeof MESSAGE_LABEL>(
      messageLocalDBService,
      messageRemoteDBService,
      deleteService,
      MESSAGE_LABEL
    );
    const chatLocalDBService = new ChatLocalDBService(messageLocalDBService);
    const chatRemoteDBService = new ChatRemoteDBService();
    const chatService = new DBService<typeof CHAT_LABEL>(
      chatLocalDBService,
      chatRemoteDBService,
      deleteService,
      CHAT_LABEL
    );
    setServices({
      chatService,
      messageService,
      fileService,
      deleteService,
    });
    syncServerClientData({
      messageService,
      chatService,
      fileService,
      deleteService,
    });
  }, []);

  return services;
}

interface ServicesContextType {
  chatService: DBService<typeof CHAT_LABEL>;
  messageService: DBService<typeof MESSAGE_LABEL>;
  fileService: DBService<typeof FILE_LABEL>;
  deleteService: DeleteLocalDBService;
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
