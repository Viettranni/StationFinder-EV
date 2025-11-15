import { IChargingStationRepository } from "./IChargingStationRepository";
import { IChargingStationDao } from "../local/dao/IChargingStationDao";
import {
  ChargingStation,
  NewChargingStation,
} from "../../domain/entities/ChargingStation";

export class LocalChargingStationRepository
  implements IChargingStationRepository
{
  constructor(private readonly dao: IChargingStationDao) {}

  getAllStations(): Promise<ChargingStation[]> {
    return this.dao.getAll();
  }

  getStationById(id: number): Promise<ChargingStation | null> {
    return this.dao.getById(id);
  }

  addStation(station: Partial<NewChargingStation>): Promise<number> {
    return this.dao.insert(station);
  }

  updateStation(
    id: number,
    station: Partial<Omit<ChargingStation, "id">>
  ): Promise<void> {
    return this.dao.update(id, station);
  }

  deleteStation(id: number): Promise<void> {
    return this.dao.delete(id);
  }
}
