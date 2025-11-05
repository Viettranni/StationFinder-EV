import { makeAutoObservable, runInAction } from "mobx";
import { IProviderRepository } from "../../data/repositories/IProviderRepository";
import { Provider, NewProvider } from "../../domain/entities/Provider";

export interface ProviderUIState {
  providers: Provider[];
  loading: boolean;
  error: string | null;
}

export class ProviderViewModel {
  state: ProviderUIState = {
    providers: [],
    loading: false,
    error: null,
  };

  constructor(private repo: IProviderRepository) {
    makeAutoObservable(this);
  }

  /**
   * Local input validation before hitting the database.
   */
  private async validateProvider(provider: NewProvider, existingId?: number) {
    if (!provider.name || !provider.name.trim()) {
      throw new Error("Provider name is required");
    }

    if (provider.selected !== "true" && provider.selected !== "false") {
      throw new Error('Selected must be "true" or "false"');
    }

    // Check for duplicates (case-insensitive)
    const allProviders = await this.repo.getAllProviders();
    const duplicate = allProviders.find(
      (p) =>
        p.name.trim().toLowerCase() === provider.name.trim().toLowerCase() &&
        p.id !== existingId
    );

    if (duplicate) {
      throw new Error(`A provider named "${provider.name}" already exists.`);
    }
  }

  async fetchProviders() {
    this.state.loading = true;
    this.state.error = null;
    try {
      const data = await this.repo.getAllProviders();
      runInAction(() => {
        this.state.providers = data;
      });
    } catch (err: any) {
      runInAction(() => {
        this.state.error = err.message || "Failed to fetch providers";
      });
    } finally {
      runInAction(() => {
        this.state.loading = false;
      });
    }
  }

  async addProvider(provider: NewProvider) {
    try {
      await this.validateProvider(provider);
      const id = await this.repo.addProvider(provider);
      await this.fetchProviders();
      return id;
    } catch (err: any) {
      runInAction(() => {
        this.state.error = err.message || "Failed to add provider";
      });
      throw err;
    }
  }

  async updateProvider(id: number, provider: NewProvider) {
    try {
      await this.validateProvider(provider, id);
      await this.repo.updateProvider(id, provider);
      await this.fetchProviders();
    } catch (err: any) {
      runInAction(() => {
        this.state.error = err.message || "Failed to update provider";
      });
      throw err;
    }
  }

  async deleteProvider(id: number) {
    try {
      await this.repo.deleteProvider(id);
      await this.fetchProviders();
    } catch (err: any) {
      runInAction(() => {
        this.state.error = err.message || "Failed to delete provider";
      });
      throw err;
    }
  }

  get uiState() {
    return { ...this.state };
  }
}
