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
}

export class VehicleViewModel {
  private state: VehicleUIState = {
    availableVehicles: [],
    filteredVehicles: [],
    selectedVehicle: null,
    savedVehicle: null,
    loading: false,
    error: null,
    searchQuery: "",
    selectedCategory: "all",
  };

  // Battery modal state
  isBatteryModalVisible = false;
  batteryOptions: number[] = [];
  selectedBattery: number | null = null;

  // Chargin speed modal state
  isChargingSpeedModalVisible = false;
  chargingSpeedOptions: number[] = [];
  selectedChargingSpeed: number | null = null;

  constructor(
    private readonly localRepo: IVehicleRepository,
    private readonly remoteRepo: RemoteVehicleRepository
  ) {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  // ================= COMPUTED =================
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

  // ================= REMOTE DATA =================
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
      runInAction(() => {
        this.state.error =
          err instanceof Error ? err.message : "Failed to fetch vehicles";
      });
    } finally {
      runInAction(() => {
        this.state.loading = false;
      });
    }
  }

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
      runInAction(() => {
        this.state.error =
          err instanceof Error ? err.message : "Failed to fetch saved vehicle";
      });
    } finally {
      runInAction(() => {
        this.state.loading = false;
      });
    }
  }

  // ================= FILTERING =================
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

  // ================= SELECTION =================
  selectVehicle(vehicle: ResponseVehicle) {
    runInAction(() => {
      this.state.selectedVehicle = vehicle;
      this.batteryOptions = vehicle.batterySizeKwh ?? [];
      this.selectedBattery = null;
      this.isBatteryModalVisible = true; // Open modal immediately
    });
  }

  closeBatteryModal() {
    runInAction(() => {
      this.isBatteryModalVisible = false;
      this.state.selectedVehicle = null;
      this.selectedBattery = null;
    });
  }

  // Inside VehicleViewModel
  selectBattery(value: number) {
    runInAction(() => {
      this.selectedBattery = value;
      if (this.uiState.selectedVehicle) {
        this.uiState.selectedVehicle.batterySizeKwh = [value];
      }
      this.isBatteryModalVisible = false;

      // Automatically open charging speed modal after battery selection
      this.openChargingSpeedSelection();
    });
  }

  // ================= CHARGING SPEED MODAL =================
  openChargingSpeedSelection() {
    if (this.uiState.selectedVehicle?.maxChargingSpeed_kW) {
      runInAction(() => {
        this.chargingSpeedOptions =
          this.uiState.selectedVehicle!.maxChargingSpeed_kW;
        this.selectedChargingSpeed = null;
        this.isChargingSpeedModalVisible = true;
      });
    }
  }

  closeChargingSpeedSelection() {
    runInAction(() => {
      this.isChargingSpeedModalVisible = false;
      this.selectedChargingSpeed = null;
    });
  }

  // Modify the back navigation for charging speed modal
  goBackToBatteryModal() {
    runInAction(() => {
      this.isChargingSpeedModalVisible = false;
      this.isBatteryModalVisible = true;
      this.selectedChargingSpeed = null;
    });
  }

  selectChargingSpeed(value: number) {
    runInAction(() => {
      this.selectedChargingSpeed = value;
      // Optionally, store in the vehicle form or selected vehicle
      if (this.uiState.selectedVehicle) {
        this.uiState.selectedVehicle.maxChargingSpeed_kW = [value];
      }
      this.closeChargingSpeedSelection();
    });
  }

  // ================= SAVE/DELETE =================
  async saveSelectedVehicle() {
    const selected = this.state.selectedVehicle;
    if (!selected) throw new Error("No vehicle selected");

    const newVehicle: NewVehicle = {
      brand: selected.brand,
      model: selected.make,
      batterySizeKwh: this.selectedBattery ?? selected.batterySizeKwh?.[0] ?? 0,
      year: new Date().getFullYear(),
      currentBatteryState: 0,
      averageConsumption: selected.efficiency ?? 0,
      latitude: 0,
      longitude: 0,
      favourites: "false",
      createdAt: new Date().toISOString(),
    };

    const existing = await this.localRepo.getAllVehicles();
    if (existing.length > 0) {
      await this.localRepo.deleteVehicle(existing[0].id);
    }

    const id = await this.localRepo.addVehicle(newVehicle);
    await this.fetchSavedVehicle();
    return id;
  }

  async deleteSavedVehicle() {
    const saved = this.state.savedVehicle;
    if (!saved) return;
    await this.localRepo.deleteVehicle(saved.id);
    runInAction(() => {
      this.state.savedVehicle = null;
    });
  }

  get uiState() {
    return this.state;
  }
}
