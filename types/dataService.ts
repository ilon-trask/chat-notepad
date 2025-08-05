import { ChangeTypes } from "./change";

export type DataService<TCreate, TUpdate, TReturn> = {
  getAll: () => Promise<TReturn[]>;
  getOne: (id: string) => Promise<TReturn | undefined>;
  create: (data: TCreate) => Promise<TReturn>;
  delete: (id: string) => Promise<boolean>;
  update: (data: TUpdate) => Promise<TReturn>;
};

export type LocalDataService<TCreate, TUpdate, TReturn> = DataService<
  TCreate,
  TUpdate,
  TReturn
> & {
  subscribe: (
    callback: (id: string, type: ChangeTypes) => void
  ) => () => void;
};
