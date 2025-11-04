// src/viewmodels/VehicleViewModel.ts
import { makeAutoObservable, runInAction } from "mobx";
import { IVehicleRepository } from "../data/repositories/IVehiclerepository";
import { Vehicle, NewVehicle } from "../domain/entities/vehicle";

// Define a single interface to hold all UI-related state
export interface VehicleUIState {
  vehicles: Vehicle[];
  loading: boolean;
  error: string | null;
}

export class VehicleViewModel {
  // Encapsulated UI state
  state: VehicleUIState = {
    vehicles: [],
    loading: false,
    error: null,
  };

  constructor(private repo: IVehicleRepository) {
    makeAutoObservable(this); // Observes `state` and methods automatically
  }

  // Fetch vehicles and update the UI state
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

  // Add a new vehicle and refresh the list
  async addVehicle(vehicle: NewVehicle) {
    try {
      const id = await this.repo.addVehicle(vehicle);
      await this.fetchVehicles(); // refresh the list
      return id;
    } catch (err: any) {
      runInAction(() => {
        this.state.error = err.message || "Failed to add vehicle";
      });
      throw err;
    }
  }

  // Delete a vehicle and refresh the list
  async deleteVehicle(id: number) {
    try {
      await this.repo.deleteVehicle(id);
      await this.fetchVehicles(); // refresh the list
    } catch (err: any) {
      runInAction(() => {
        this.state.error = err.message || "Failed to delete vehicle";
      });
      throw err;
    }
  }

  // Optional computed snapshot for UI (helps with destructuring)
  get uiState() {
    return { ...this.state };
  }
}
