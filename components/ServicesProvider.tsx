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
import syncServerClientData from "@/data/syncServerClientData";
import FileService from "@/data/fileService";
import DeleteService from "@/data/deleteService";

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
    const deleteService = new DeleteService();
    const fileService = new FileService(deleteService);
    const messageService = new MessageService(fileService, deleteService);
    const chatService = new ChatService(deleteService, messageService);
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
  chatService: ChatService;
  messageService: MessageService;
  fileService: FileService;
  deleteService: DeleteService;
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
