export type DataService<T extends { return: any; create: any; update: any }> = {
  getAll: () => Promise<T["return"][]>;
  getOne: (id: string) => Promise<T["return"]>;
  create: (data: T["create"]) => Promise<T["return"]>;
  delete: (id: string) => Promise<boolean>;
  update: (data: T["update"]) => Promise<T["return"]>;
};

export type LocalDataService<
  T extends { return: any; create: any; update: any },
> = DataService<T> & {
  subscribe: (callback: () => void) => () => void;
};
