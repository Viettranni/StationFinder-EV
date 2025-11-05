import { Provider, NewProvider } from "../../domain/entities/Provider";

export interface IProviderRepository {
  getAllProviders(): Promise<Provider[]>;
  getProviderById(id: number): Promise<Provider | null>;
  addProvider(provider: Partial<NewProvider>): Promise<number>;
  updateProvider(
    id: number,
    provider: Partial<Omit<Provider, "id">>
  ): Promise<void>;
  deleteProvider(id: number): Promise<void>;
}
