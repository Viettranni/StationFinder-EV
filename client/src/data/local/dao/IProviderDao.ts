import { Provider, NewProvider } from "../../../domain/entities/Provider";

export interface IProviderDao {
  getAll(): Promise<Provider[]>;
  getById(id: number): Promise<Provider | null>;
  insert(provider: Partial<NewProvider>): Promise<number>;
  update(id: number, provider: Partial<Omit<Provider, "id">>): Promise<void>;
  delete(id: number): Promise<void>;
}
