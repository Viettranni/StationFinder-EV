import {
  ChargingStation,
  NewChargingStation,
} from "../../../domain/entities/ChargingStation";

export interface IChargingStationDao {
  getAll(): Promise<ChargingStation[]>;
  getById(id: number): Promise<ChargingStation | null>;
  insert(station: Partial<NewChargingStation>): Promise<number>;
  update(
    id: number,
    station: Partial<Omit<ChargingStation, "id">>
  ): Promise<void>;
  delete(id: number): Promise<void>;
}
