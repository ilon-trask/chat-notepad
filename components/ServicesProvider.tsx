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
import useUIStore from "@/data/UIStore";
import { DataService as IDataService } from "@/types/dataService";

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

  const UIStore = useUIStore();

  useEffect(() => {
    const dataDB = new LocalDBService<Data>(DATA_LABEL);
    const changeDB = new LocalDBService<LocalChange>(CHANGE_LABEL);
    const changeService = new ChangeService(changeDB, dataDB);
    const dataService = new DataService(dataDB, changeService, UIStore);
    const resolver = new Resolver(dataDB, changeDB, changeService, UIStore);
    resolver.subscribeResolver();
    resolver.subscribeSendChanges();
    setServices({
      chatService: dataService as IDataService<LocalChat>,
      fileService: dataService as IDataService<LocalFileType>,
      messageService: dataService as IDataService<LocalMessage>,
    });
  }, []);

  return services;
}

interface ServicesContextType {
  chatService: IDataService<LocalChat>;
  messageService: IDataService<LocalMessage>;
  fileService: IDataService<LocalFileType>;
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
