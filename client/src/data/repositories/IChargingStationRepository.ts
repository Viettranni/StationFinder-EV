import {
  ChargingStation,
  NewChargingStation,
} from "../../domain/entities/ChargingStation";

export interface IChargingStationRepository {
  getAllStations(): Promise<ChargingStation[]>;
  getStationById(id: number): Promise<ChargingStation | null>;
  addStation(station: Partial<NewChargingStation>): Promise<number>;
  updateStation(
    id: number,
    station: Partial<Omit<ChargingStation, "id">>
  ): Promise<void>;
  deleteStation(id: number): Promise<void>;
}
