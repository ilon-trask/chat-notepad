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
import isOnline from "@/helpers/isOnline";
import { useClerk } from "@clerk/nextjs";

type NullableServicesContextType = {
  [K in keyof ServicesContextType]: ServicesContextType[K] | null;
};

type Return = { services: NullableServicesContextType; loading: boolean };
const dataDB = new LocalDBService<Data>(DATA_LABEL);
const changeDB = new LocalDBService<LocalChange>(CHANGE_LABEL);

export default function useServices(): Return {
  const [services, setServices] = useState<NullableServicesContextType>({
    chatService: null,
    messageService: null,
    fileService: null,
  });

  const [loading, setLoading] = useState(true);

  const UIStore = useUIStore();

  const clerk = useClerk();

  useEffect(() => {
    if (!clerk.isSignedIn && clerk.loaded) {
      Promise.all([dataDB.clearAll(), changeDB.clearAll()]).catch(() => {});
      UIStore.reset();
      clerk.redirectToSignIn();
    }
  }, [clerk.isSignedIn, clerk.loaded]);

  useEffect(() => {
    const changeService = new ChangeService(changeDB, dataDB);
    const dataService = new DataService(dataDB, changeService, UIStore);
    const resolver = new Resolver(dataDB, changeDB, changeService, UIStore);

    setServices({
      chatService: dataService as IDataService<LocalChat>,
      fileService: dataService as IDataService<LocalFileType>,
      messageService: dataService as IDataService<LocalMessage>,
    });

    let unsubs: Array<() => void> = [];
    const onlineFunc = async () => {
      const data = await dataDB.getAll();
      if (!data.length) await resolver.firstUpToDate();
      await resolver.upToDateChanges();
      unsubs.push(await resolver.subscribeResolver());
      unsubs.push(resolver.subscribeSendChanges());
      await resolver.subscribeOfflineResolver();
    };

    if (UIStore.data.length == 0) resolver.loadUI(() => setLoading(false));

    if (isOnline()) {
      onlineFunc();
    } 

    const offlineFunc = () => {
      unsubs.forEach((unsub) => unsub());
      unsubs = [];
    };

    window.addEventListener("online", onlineFunc);
    window.addEventListener("offline", offlineFunc);
    return () => {
      window.removeEventListener("online", onlineFunc);
      window.removeEventListener("offline", offlineFunc);
    };
  }, []);

  return { services: services, loading: loading };
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
  const { services, loading } = useServices();

  if (loading) return <div>Loading services...</div>;

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
