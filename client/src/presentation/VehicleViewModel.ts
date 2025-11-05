// src/viewmodels/VehicleViewModel.ts
import { makeAutoObservable, runInAction } from "mobx";
import { IVehicleRepository } from "../data/repositories/IVehiclerepository";
import { Vehicle, NewVehicle } from "../domain/entities/vehicle";

export interface VehicleUIState {
  vehicles: Vehicle[];
  loading: boolean;
  error: string | null;
}

export class VehicleViewModel {
  state: VehicleUIState = {
    vehicles: [],
    loading: false,
    error: null,
  };

  constructor(private repo: IVehicleRepository) {
    makeAutoObservable(this);
  }

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

  async fetchVehicles() {
    this.state.loading = true;
    this.state.error = null;
    try {
      const data = await this.repo.getAllVehicles();
      runInAction(() => {
        this.state.vehicles = data;
      });
    } catch (err: any) {
      runInAction(() => {
        this.state.error = err.message || "Failed to fetch vehicles";
      });
    } finally {
      runInAction(() => {
        this.state.loading = false;
      });
    }
  }

  async addVehicle(vehicle: NewVehicle) {
    try {
      this.validateVehicle(vehicle);
      const id = await this.repo.addVehicle(vehicle);
      await this.fetchVehicles();
      return id;
    } catch (err: any) {
      runInAction(() => {
        this.state.error = err.message || "Failed to add vehicle";
      });
      throw err;
    }
  }

  async updateVehicle(id: number, vehicle: NewVehicle) {
    try {
      this.validateVehicle(vehicle);
      await this.repo.updateVehicle(id, vehicle);
      await this.fetchVehicles();
    } catch (err: any) {
      runInAction(() => {
        this.state.error = err.message || "Failed to update vehicle";
      });
      throw err;
    }
  }

  async deleteVehicle(id: number) {
    try {
      await this.repo.deleteVehicle(id);
      await this.fetchVehicles();
    } catch (err: any) {
      runInAction(() => {
        this.state.error = err.message || "Failed to delete vehicle";
      });
      throw err;
    }
  }

  get uiState() {
    return { ...this.state };
  }
}
