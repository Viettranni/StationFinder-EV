import { makeAutoObservable, runInAction } from "mobx";
import { IVehicleRepository } from "../../data/repositories/IVehiclerepository";
import { RemoteVehicleRepository } from "../../data/repositories/RemoteVehicleRepository";
import { ResponseVehicle } from "../../data/local/dao/ResponseVehicle";
import { Vehicle, NewVehicle } from "../../domain/entities/Vehicle";

export interface VehicleUIState {
  availableVehicles: ResponseVehicle[];
  filteredVehicles: ResponseVehicle[]; // 👈 new
  selectedVehicle: ResponseVehicle | null;
  savedVehicle: Vehicle | null;
  loading: boolean;
  error: string | null;
  searchQuery: string; // 👈 new
  selectedCategory: string; // 👈 new
}

export class VehicleViewModel {
  state: VehicleUIState = {
    availableVehicles: [],
    filteredVehicles: [],
    selectedVehicle: null,
    savedVehicle: null,
    loading: false,
    error: null,
    searchQuery: "",
    selectedCategory: "all",
  };

  constructor(
    private readonly localRepo: IVehicleRepository,
    private readonly remoteRepo: RemoteVehicleRepository
  ) {
    makeAutoObservable(this);
  }

  // ========================
  // Remote data (API)
  // ========================
  async fetchAvailableVehicles() {
    this.state.loading = true;
    this.state.error = null;
    try {
      const data = await this.remoteRepo.getAllVehicles();
      runInAction(() => {
        this.state.availableVehicles = data;
        this.state.filteredVehicles = data; // initialize
      });
    } catch (err: any) {
      runInAction(() => {
        this.state.error = err.message || "Failed to fetch available vehicles";
      });
    } finally {
      runInAction(() => {
        this.state.loading = false;
      });
    }
  }

  // ========================
  // Local data (DB)
  // ========================
  async fetchSavedVehicle() {
    this.state.loading = true;
    this.state.error = null;
    try {
      const vehicles = await this.localRepo.getAllVehicles();
      runInAction(() => {
        this.state.savedVehicle = vehicles[0] ?? null;
      });
    } catch (err: any) {
      runInAction(() => {
        this.state.error = err.message || "Failed to fetch saved vehicle";
      });
    } finally {
      runInAction(() => {
        this.state.loading = false;
      });
    }
  }

  // ========================
  // Filtering logic
  // ========================
  setSearchQuery(query: string) {
    runInAction(() => {
      this.state.searchQuery = query;
    });
    this.applyFilters();
  }

  setSelectedCategory(category: string) {
    runInAction(() => {
      this.state.selectedCategory = category;
    });
    this.applyFilters();
  }

  private applyFilters() {
    const query = this.state.searchQuery.toLowerCase();
    const category = this.state.selectedCategory.toLowerCase();

    const filtered = this.state.availableVehicles.filter((v) => {
      const brand = v.brand?.toLowerCase() ?? "";
      const model = v.make?.toLowerCase() ?? "";

      const matchesCategory = category === "all" || brand.includes(category);
      const matchesQuery =
        query === "" || brand.includes(query) || model.includes(query);

      return matchesCategory && matchesQuery;
    });

    runInAction(() => {
      this.state.filteredVehicles = filtered;
    });
  }

  // ========================
  // User selection
  // ========================
  selectVehicle(vehicle: ResponseVehicle) {
    runInAction(() => {
      this.state.selectedVehicle = vehicle;
    });
  }

  // ========================
  // Validation
  // ========================
  private validateVehicle(vehicle: NewVehicle) {
    if (!vehicle.brand || !vehicle.model) {
      throw new Error("Brand and model are required");
    }
    if (vehicle.year && (vehicle.year < 2000 || vehicle.year > 2100)) {
      throw new Error("Year must be between 2000 and 2100");
    }
    if (vehicle.batterySizeKwh <= 0) {
      throw new Error("Battery size must be positive");
    }
    if (
      vehicle.currentBatteryState < 0 ||
      vehicle.currentBatteryState > vehicle.batterySizeKwh
    ) {
      throw new Error("Invalid current battery state");
    }
    if (vehicle.averageConsumption < 0) {
      throw new Error("Average consumption must be non-negative");
    }
    if (vehicle.latitude < -90 || vehicle.latitude > 90) {
      throw new Error("Latitude must be between -90 and 90");
    }
    if (vehicle.longitude < -180 || vehicle.longitude > 180) {
      throw new Error("Longitude must be between -180 and 180");
    }
    if (vehicle.favourites !== "true" && vehicle.favourites !== "false") {
      throw new Error('Favourites must be "true" or "false"');
    }
    if (!vehicle.createdAt) {
      throw new Error("createdAt is required");
    }
  }

  // ========================
  // Save selected -> local DB
  // ========================
  async saveSelectedVehicle(userValues: Partial<NewVehicle>) {
    if (!this.state.selectedVehicle) {
      throw new Error("No vehicle selected");
    }

    try {
      const selected = this.state.selectedVehicle;

      const newVehicle: NewVehicle = {
        brand: selected.brand,
        model: selected.make,
        year: userValues.year ?? new Date().getFullYear(),
        batterySizeKwh: userValues.batterySizeKwh ?? selected.batterySizeKwh[0],
        currentBatteryState: userValues.currentBatteryState ?? 0,
        averageConsumption:
          userValues.averageConsumption ?? selected.efficiency,
        latitude: userValues.latitude ?? 0,
        longitude: userValues.longitude ?? 0,
        favourites: userValues.favourites ?? "false",
        createdAt: new Date().toISOString(),
      };

      this.validateVehicle(newVehicle);

      const existing = await this.localRepo.getAllVehicles();
      if (existing.length > 0) {
        await this.localRepo.deleteVehicle(existing[0].id);
      }

      const id = await this.localRepo.addVehicle(newVehicle);
      await this.fetchSavedVehicle();

      return id;
    } catch (err: any) {
      runInAction(() => {
        this.state.error = err.message || "Failed to save vehicle";
      });
      throw err;
    }
  }

  // ========================
  // Delete saved vehicle
  // ========================
  async deleteSavedVehicle() {
    if (!this.state.savedVehicle) return;
    try {
      await this.localRepo.deleteVehicle(this.state.savedVehicle.id);
      runInAction(() => {
        this.state.savedVehicle = null;
      });
    } catch (err: any) {
      runInAction(() => {
        this.state.error = err.message || "Failed to delete saved vehicle";
      });
      throw err;
    }
  }

  // ========================
  // UI State getter
  // ========================
  get uiState() {
    return { ...this.state };
  }
}
