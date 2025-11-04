// src/data/repositories/LocalVehicleRepository.ts
import { IVehicleRepository } from "./IVehiclerepository";
import { IVehicleDao } from "../dao/IVehicleDao";
import { Vehicle, NewVehicle } from "../../domain/entities/vehicle";

export class LocalVehicleRepository implements IVehicleRepository {
  constructor(private readonly dao: IVehicleDao) {}

  getAllVehicles(): Promise<Vehicle[]> {
    return this.dao.getAll();
  }

  getVehicleById(id: number): Promise<Vehicle | null> {
    return this.dao.getById(id);
  }

  addVehicle(vehicle: Partial<NewVehicle>): Promise<number> {
    return this.dao.insert(vehicle);
  }

  updateVehicle(
    id: number,
    vehicle: Partial<Omit<Vehicle, "id">>
  ): Promise<void> {
    return this.dao.update(id, vehicle);
  }

  deleteVehicle(id: number): Promise<void> {
    return this.dao.delete(id);
  }
}
