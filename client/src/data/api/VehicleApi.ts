import { ResponseVehicle } from "../local/dao/ResponseVehicle";
import mockVehicleList from "../../mock/VehicleList.json";

/**
 * API layer responsible for fetching vehicle data from a remote source.
 * Can optionally serve mock data instead (useful for local dev or offline testing).
 */
export class VehicleApi {
  constructor(
    private readonly baseUrl: string | null = null, // pass null if you only want mock
    private readonly useMock: boolean = false
  ) {}

  /**
   * Fetch all vehicles from the API or from a local mock file.
   */
  async fetchAllVehicles(): Promise<ResponseVehicle[]> {
    if (this.useMock || !this.baseUrl) {
      console.log("📦 Using mock vehicle data from VehicleList.json");
      return mockVehicleList as ResponseVehicle[];
    }

    try {
      const response = await fetch(`${this.baseUrl}/vehicles`);
      if (!response.ok) {
        throw new Error(`Failed to fetch vehicles: ${response.statusText}`);
      }
      const data = await response.json();
      return data as ResponseVehicle[];
    } catch (error) {
      console.error("VehicleApi.fetchAllVehicles failed:", error);
      throw error;
    }
  }
}
