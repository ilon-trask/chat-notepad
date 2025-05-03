export type DataService<T> = {
    getAll: () => Promise<T[]>;
    create: (data:T) => Promise<T>;
    delete: (id:string) => Promise<boolean>;
    update: (data:T) => Promise<T>;
}
