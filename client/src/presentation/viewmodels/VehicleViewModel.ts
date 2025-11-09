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

  batteryOptions: number[] = [];
  selectedBattery: number | null = null;

  chargingSpeedOptions: number[] = [];
  selectedChargingSpeed: number | null = null;

  isCustomVehicleSelected = false;

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
    runInAction(() => {
      this.state.searchQuery = query;
      this.applyFilters();
    });
  }

  setSelectedCategory(category: string) {
    runInAction(() => {
      this.state.selectedCategory = category;
      this.applyFilters();
    });
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

  // ================= SELECTION =================
  selectVehicle(vehicle: ResponseVehicle) {
    runInAction(() => {
      this.state.selectedVehicle = vehicle;
      this.batteryOptions = vehicle.batterySizeKwh ?? [];
      this.selectedBattery = null;
      this.chargingSpeedOptions = vehicle.maxChargingSpeed_kW ?? [];
      this.selectedChargingSpeed = null;
      this.isCustomVehicleSelected = false;
    });
  }

  selectCustomVehicle() {
    runInAction(() => {
      this.state.selectedVehicle = {
        brand: "",
        make: "",
        batterySizeKwh: [],
        maxChargingSpeed_kW: [],
        efficiency: 0,
        imageUrl: "",
      };
      this.batteryOptions = [];
      this.selectedBattery = null;
      this.chargingSpeedOptions = [];
      this.selectedChargingSpeed = null;
      this.isCustomVehicleSelected = true;
    });
  }

  resetCustomVehicle() {
    runInAction(() => {
      this.state.selectedVehicle = null;
      this.isCustomVehicleSelected = false;
      this.batteryOptions = [];
      this.selectedBattery = null;
      this.chargingSpeedOptions = [];
      this.selectedChargingSpeed = null;
    });
  }

  // ================= STRICT MODE SETTERS =================
  setBrand(brand: string) {
    runInAction(() => {
      if (this.state.selectedVehicle) this.state.selectedVehicle.brand = brand;
    });
  }

  setMake(make: string) {
    runInAction(() => {
      if (this.state.selectedVehicle) this.state.selectedVehicle.make = make;
    });
  }

  setEfficiency(eff: number) {
    runInAction(() => {
      if (this.state.selectedVehicle)
        this.state.selectedVehicle.efficiency = eff;
    });
  }

  setBatterySize(kwh: number) {
    runInAction(() => {
      if (this.state.selectedVehicle)
        this.state.selectedVehicle.batterySizeKwh = [kwh];
    });
  }

  setMaxChargingSpeed(kW: number) {
    runInAction(() => {
      if (this.state.selectedVehicle)
        this.state.selectedVehicle.maxChargingSpeed_kW = [kW];
    });
  }

  setCurrentBatteryState(value: number) {
    runInAction(() => {
      if (this.state.selectedVehicle) {
        this.state.selectedVehicle.currentBatteryState = value;
      }
    });
  }

  selectBattery(value: number) {
    runInAction(() => {
      this.selectedBattery = value;
      if (this.state.selectedVehicle) {
        this.state.selectedVehicle.batterySizeKwh = [value];
      }
    });
  }

  selectChargingSpeed(value: number) {
    runInAction(() => {
      this.selectedChargingSpeed = value;
      if (this.state.selectedVehicle) {
        this.state.selectedVehicle.maxChargingSpeed_kW = [value];
      }
    });
  }

  // ======================== Validation ========================
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
    if (vehicle.maxChargingSpeed_kW < 0) {
      throw new Error("Max charging speed must be non-negative"); // ✅ validate charging speed
    }
    if (vehicle.currentBatteryState < 0 || vehicle.currentBatteryState > 100) {
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

  // ================= SAVE/DELETE =================
  async saveSelectedVehicle() {
    const selected = this.state.selectedVehicle;
    if (!selected) throw new Error("No vehicle selected");

    const newVehicle: NewVehicle = {
      brand: selected.brand,
      model: selected.make,
      batterySizeKwh: this.selectedBattery ?? selected.batterySizeKwh?.[0] ?? 0,
      maxChargingSpeed_kW:
        this.selectedChargingSpeed ?? selected.maxChargingSpeed_kW?.[0] ?? 0,
      year: new Date().getFullYear(),
      currentBatteryState: this.state.selectedVehicle?.currentBatteryState ?? 0,
      averageConsumption: selected.efficiency ?? 0,
      latitude: 0,
      longitude: 0,
      favourites: "false",
      createdAt: new Date().toISOString(),
    };

    // Validate before saving
    this.validateVehicle(newVehicle);

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
