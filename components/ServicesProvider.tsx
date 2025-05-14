"use client";
import React, { createContext, useContext, ReactNode } from "react";

import useServices from "@/data/useServcies";
import ChatService from "@/data/chatService";
import MessageService from "@/data/messageService";
import { ConvexReactClient, useConvexAuth } from "convex/react";

interface ServicesContextType {
  chatService: ChatService;
  messageService: MessageService;
  convexDB: ConvexReactClient;
}

const ServiceContext = createContext<ServicesContextType | null>(null);

interface ServiceProviderProps {
  children: ReactNode;
}

export const ServiceProvider = ({ children }: ServiceProviderProps) => {
  const { chatService, messageService, convexDB } = useServices();
  const { isLoading } = useConvexAuth();

  if (!chatService || !messageService || !convexDB || isLoading)
    return <div>Loading services...</div>;

  return (
    <ServiceContext.Provider
      value={{
        chatService,
        messageService,
        convexDB,
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
