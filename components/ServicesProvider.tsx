"use client";
import { DATA_LABEL } from "@/data/localDB/createLocalDB";
import { LocalDBService } from "@/data/localDB/localDBService";
import { LocalChat } from "@/types/data/chat";
import { Data } from "@/types/data/data";
import { LocalFileType } from "@/types/data/file";
import { LocalMessage } from "@/types/data/message";
import React, {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from "react";
import { Resolver } from "../data/resolver";
import { CHANGE_LABEL } from "@/constants/labels";
import { ChangeService } from "@/data/changeService";
import { LocalChange } from "@/types/change";
import { DataService } from "@/data/dataService";

type NullableServicesContextType = {
  [K in keyof ServicesContextType]: ServicesContextType[K] | null;
};

type Return = NullableServicesContextType;

export default function useServices(): Return {
  const [services, setServices] = useState<Return>({
    chatService: null,
    messageService: null,
    fileService: null,
  });

  useEffect(() => {
    const dataDB = new LocalDBService<Data, Data, Data>(DATA_LABEL);
    const changeDB = new LocalDBService<LocalChange, LocalChange, LocalChange>(
      CHANGE_LABEL
    );
    const changeService = new ChangeService(changeDB, dataDB);
    const dataService = new DataService(dataDB, changeService);
    const resolver = new Resolver(dataDB, changeDB, changeService);
    resolver.subscribeResolver();
    resolver.subscribeSendChanges();
    setServices({
      chatService: dataService as any,
      fileService: dataService as any,
      messageService: dataService as any,
    });
  }, []);

  return services;
}

interface ServicesContextType {
  chatService: LocalDBService<LocalChat, LocalChat, LocalChat>;
  messageService: LocalDBService<LocalMessage, LocalMessage, LocalMessage>;
  fileService: LocalDBService<LocalFileType, LocalFileType, LocalFileType>;
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
