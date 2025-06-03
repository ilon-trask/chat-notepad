"use client";
import React, { createContext, useContext, ReactNode } from "react";

import useServices from "@/data/useServcies";
import ChatService from "@/data/chatService";
import MessageService from "@/data/messageService";
import DeleteService from "@/data/deleteService";

interface ServicesContextType {
  chatService: ChatService;
  messageService: MessageService;
  deleteService: DeleteService;
}

const ServiceContext = createContext<ServicesContextType | null>(null);

interface ServiceProviderProps {
  children: ReactNode;
}

export const ServiceProvider = ({ children }: ServiceProviderProps) => {
  const { chatService, messageService, deleteService } = useServices();

  if (!chatService || !messageService || !deleteService)
    return <div>Loading services...</div>;

  return (
    <ServiceContext.Provider
      value={{
        chatService,
        messageService,
        deleteService,
      }}
    >
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
