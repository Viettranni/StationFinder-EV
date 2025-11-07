// src/data/repositories/RemoteVehicleRepository.ts
import { VehicleApi } from "../api/VehicleApi";
import { ResponseVehicle } from "../local/dao/ResponseVehicle";

/**
 * Repository responsible for fetching remote vehicle data.
 * Delegates the actual HTTP logic to VehicleApi.
 */
export class RemoteVehicleRepository {
  constructor(private readonly vehicleApi: VehicleApi) {}

  /**
   * Get all vehicles from the remote source.
   */
  async getAllVehicles(): Promise<ResponseVehicle[]> {
    try {
      const vehicles = await this.vehicleApi.fetchAllVehicles();
      return vehicles;
    } catch (error) {
      console.error("RemoteVehicleRepository.getAllVehicles failed:", error);
      throw error;
    }
  }
}
