// src/data/dao/IVehicleDao.ts
import { Vehicle, NewVehicle } from "../../domain/entities/vehicle";

export interface IVehicleDao {
  getAll(): Promise<Vehicle[]>;
  getById(id: number): Promise<Vehicle | null>;
  insert(vehicle: Partial<NewVehicle>): Promise<number>;
  update(id: number, vehicle: Partial<Omit<Vehicle, "id">>): Promise<void>;
  delete(id: number): Promise<void>;
}
