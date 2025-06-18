import { Labels } from "@/constants/labels"; 

type T = any;

export type DataService = {
    getAll: (label: Labels) => Promise<T[]>;
    getOne: (label: Labels, id: string) => Promise<T>;
    create: (label: Labels, data: T) => Promise<T>;
    delete: (label: Labels, id: string) => Promise<boolean>;
    update: (label: Labels, data: T) => Promise<T>;
}
