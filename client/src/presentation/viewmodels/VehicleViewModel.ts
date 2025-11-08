import { makeAutoObservable, runInAction } from "mobx";
import { IVehicleRepository } from "../../data/repositories/IVehiclerepository";
import { RemoteVehicleRepository } from "../../data/repositories/RemoteVehicleRepository";
import { ResponseVehicle } from "../../data/local/dao/ResponseVehicle";
import { Vehicle, NewVehicle } from "../../domain/entities/Vehicle";

export interface VehicleUIState {
  availableVehicles: ResponseVehicle[];
  filteredVehicles: ResponseVehicle[];
  selectedVehicle: ResponseVehicle | null;
  savedVehicle: Vehicle | null;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  selectedCategory: string;
  formValues: Partial<NewVehicle>;
}

export class VehicleViewModel {
  // ============== Observable State ==============
  private state: VehicleUIState = {
    availableVehicles: [],
    filteredVehicles: [],
    selectedVehicle: null,
    savedVehicle: null,
    loading: false,
    error: null,
    searchQuery: "",
    selectedCategory: "all",
    formValues: {},
  };

  constructor(
    private readonly localRepo: IVehicleRepository,
    private readonly remoteRepo: RemoteVehicleRepository
  ) {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  // ==================================================
  // COMPUTED PROPERTIES
  // ==================================================

  get categories() {
    const brands = Array.from(
      new Set(
        this.state.availableVehicles
          .map((v) => v.brand?.toLowerCase().trim())
          .filter((b): b is string => !!b && b.length > 0)
      )
    ).sort();

    return [
      { id: "all", name: "All" },
      ...brands.map((b) => ({ id: b, name: this.capitalize(b) })),
    ];
  }

  private capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // ==================================================
  // REMOTE DATA (API)
  // ==================================================

  async fetchAvailableVehicles() {
    runInAction(() => {
      this.state.loading = true;
      this.state.error = null;
    });

    try {
      const data = await this.remoteRepo.getAllVehicles();
      runInAction(() => {
        this.state.availableVehicles = data;
        this.state.filteredVehicles = data;
      });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to fetch available vehicles";
      runInAction(() => {
        this.state.error = message;
      });
    } finally {
      runInAction(() => {
        this.state.loading = false;
      });
    }
  }

  // ==================================================
  // LOCAL DATA (DB)
  // ==================================================

  async fetchSavedVehicle() {
    runInAction(() => {
      this.state.loading = true;
      this.state.error = null;
    });

    try {
      const vehicles = await this.localRepo.getAllVehicles();
      runInAction(() => {
        this.state.savedVehicle = vehicles[0] ?? null;
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch saved vehicle";
      runInAction(() => {
        this.state.error = message;
      });
    } finally {
      runInAction(() => {
        this.state.loading = false;
      });
    }
  }

  // ==================================================
  // FILTERING LOGIC
  // ==================================================

  setSearchQuery(query: string) {
    this.state.searchQuery = query;
    this.applyFilters();
  }

  setSelectedCategory(category: string) {
    this.state.selectedCategory = category;
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

    this.state.filteredVehicles = filtered;
  }

  // ==================================================
  // SELECTION + FORM MANAGEMENT
  // ==================================================

  selectVehicle(vehicle: ResponseVehicle) {
    this.state.selectedVehicle = vehicle;
    this.state.formValues = {
      brand: vehicle.brand,
      model: vehicle.make,
      year: new Date().getFullYear(),
      batterySizeKwh: vehicle.batterySizeKwh?.[0] ?? 0,
      currentBatteryState: 0,
      averageConsumption: vehicle.efficiency ?? 0,
      latitude: 0,
      longitude: 0,
      favourites: "false",
      createdAt: new Date().toISOString(),
    };
  }

  clearSelectedVehicle() {
    this.state.selectedVehicle = null;
    this.state.formValues = {};
  }

  updateFormValue<K extends keyof NewVehicle>(key: K, value: NewVehicle[K]) {
    this.state.formValues[key] = value;
  }

  // ==================================================
  // VALIDATION
  // ==================================================

  private validateVehicle(vehicle: NewVehicle) {
    if (!vehicle.brand || !vehicle.model)
      throw new Error("Brand and model are required");
    if (vehicle.year < 2000 || vehicle.year > 2100)
      throw new Error("Year must be between 2000 and 2100");
    if (vehicle.batterySizeKwh <= 0)
      throw new Error("Battery size must be positive");
    if (
      vehicle.currentBatteryState < 0 ||
      vehicle.currentBatteryState > vehicle.batterySizeKwh
    )
      throw new Error("Invalid current battery state");
  }

  // ==================================================
  // SAVE SELECTED VEHICLE → LOCAL DB
  // ==================================================

  async saveSelectedVehicle() {
    const selected = this.state.selectedVehicle;
    const form = this.state.formValues;
    if (!selected) throw new Error("No vehicle selected");

    const newVehicle: NewVehicle = {
      ...form,
      brand: selected.brand,
      model: selected.make,
      createdAt: new Date().toISOString(),
    } as NewVehicle;

    this.validateVehicle(newVehicle);

    const existing = await this.localRepo.getAllVehicles();
    if (existing.length > 0) {
      await this.localRepo.deleteVehicle(existing[0].id);
    }

    const id = await this.localRepo.addVehicle(newVehicle);
    await this.fetchSavedVehicle();
    return id;
  }

  // ==================================================
  // DELETE SAVED VEHICLE
  // ==================================================

  async deleteSavedVehicle() {
    const saved = this.state.savedVehicle;
    if (!saved) return;

    await this.localRepo.deleteVehicle(saved.id);

    runInAction(() => {
      this.state.savedVehicle = null;
    });
  }

  // ==================================================
  // UI STATE GETTER
  // ==================================================

  get uiState() {
    // Return actual observable state (not a shallow copy)
    return this.state;
  }
}
