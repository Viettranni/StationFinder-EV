import { ResponseChargingStation } from "../local/dao/ResponseChargingStation";
import mockChargingStationList from "../../mock/ChargingStationList.json";

/**
 * API layer responsible for fetching charging station data from a remote source.
 * Can optionally serve mock data instead (useful for local dev or offline testing).
 */
export class ChargingStationApi {
  constructor(
    private readonly baseUrl: string | null = null, // pass null for mock-only mode
    private readonly useMock: boolean = false
  ) {}

  /**
   * Fetch all charging stations from the API or from a local mock file.
   */
  async fetchAllStations(): Promise<ResponseChargingStation[]> {
    if (this.useMock || !this.baseUrl) {
      console.log(
        "📦 Using mock charging station data from ChargingStationList.json"
      );
      return mockChargingStationList as ResponseChargingStation[];
    }

    try {
      const response = await fetch(`${this.baseUrl}/charging-stations`);
      if (!response.ok) {
        throw new Error(`Failed to fetch stations: ${response.statusText}`);
      }
      const data = await response.json();
      return data as ResponseChargingStation[];
    } catch (error) {
      console.error("ChargingStationApi.fetchAllStations failed:", error);
      throw error;
    }
  }
}
