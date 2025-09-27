import { useServicesContext } from "@/components/ServicesProvider";
import { useLiveQuery } from "dexie-react-hooks";
import useUIStore from "./UIStore";

export default function useSyncIndexDbAndView() {
    const { chatService } = useServicesContext();
    const UIStore = useUIStore();
    useLiveQuery(async () => {
        const data = await chatService.getAll();
        UIStore.set(data);
    });
}