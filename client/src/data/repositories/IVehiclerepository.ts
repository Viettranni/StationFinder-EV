// src/domain/repositories/IVehicleRepository.ts
import { Vehicle, NewVehicle } from "../../domain/entities/vehicle";

export interface IVehicleRepository {
  getAllVehicles(): Promise<Vehicle[]>;
  getVehicleById(id: number): Promise<Vehicle | null>;
  addVehicle(vehicle: Partial<NewVehicle>): Promise<number>;
  updateVehicle(
    id: number,
    vehicle: Partial<Omit<Vehicle, "id">>
  ): Promise<void>;
  deleteVehicle(id: number): Promise<void>;
}
