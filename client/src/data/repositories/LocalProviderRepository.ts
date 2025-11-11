import { IProviderRepository } from "../repositories/IProviderRepository";
import { IProviderDao } from "../local/dao/IProviderDao";
import { Provider, NewProvider } from "../../domain/entities/Provider";

export class LocalProviderRepository implements IProviderRepository {
  constructor(private readonly dao: IProviderDao) {}

  getAllProviders(): Promise<Provider[]> {
    return this.dao.getAll();
  }

  getProviderById(id: number): Promise<Provider | null> {
    return this.dao.getById(id);
  }

  addProvider(provider: Partial<NewProvider>): Promise<number> {
    return this.dao.insert(provider);
  }

  updateProvider(
    id: number,
    provider: Partial<Omit<Provider, "id">>
  ): Promise<void> {
    return this.dao.update(id, provider);
  }

  deleteProvider(id: number): Promise<void> {
    return this.dao.delete(id);
  }
}
