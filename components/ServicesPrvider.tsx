"use client";
import React, { createContext, useContext, ReactNode } from "react";

import useServices from "@/data/useServcies";
import ChatService from "@/data/chatService";
import MessageService from "@/data/messageService";


interface ServicesContextType {
  chatService: ChatService;
  messageService: MessageService;
}

const ServiceContext = createContext<ServicesContextType | null>(null);

interface ServiceProviderProps {
  children: ReactNode;
}

export const ServiceProvider = ({ children }: ServiceProviderProps) => {
  const { chatService, messageService } = useServices();

  if (!chatService || !messageService) return <div>Loading services...</div>;

  return (
    <ServiceContext.Provider
      value={{
        chatService,
        messageService,
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
