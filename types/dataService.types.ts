type T = any;

export type DataService = {
  getAll: () => Promise<T[]>;
  getOne: (id: string) => Promise<T>;
  create: (data: T) => Promise<T>;
  delete: (id: string) => Promise<boolean>;
  update: (data: T) => Promise<T>;
};
