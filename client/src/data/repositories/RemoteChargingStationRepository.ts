import { ChargingStationApi } from "../api/ChargingStationApi";
import { ResponseChargingStation } from "../local/dao/ResponseChargingStation";

/**
 * Repository responsible for fetching remote charging station data.
 * Delegates the actual HTTP logic to ChargingStationApi.
 */
export class RemoteChargingStationRepository {
  constructor(private readonly stationApi: ChargingStationApi) {}

  /**
   * Get all charging stations from the remote source.
   */
  async getAllStations(): Promise<ResponseChargingStation[]> {
    try {
      const stations = await this.stationApi.fetchAllStations();
      return stations;
    } catch (error) {
      console.error(
        "RemoteChargingStationRepository.getAllStations failed:",
        error
      );
      throw error;
    }
  }
}
