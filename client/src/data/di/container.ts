// src/data/di/Container.ts
import { initDB, getDB } from "../local/database";
import { VehicleDao } from "../dao/VehicleDao";
import { LocalVehicleRepository } from "../repositories/LocalVehicleRepository";

export class Container {
  private static instance: Container;

  public vehicleRepository!: LocalVehicleRepository;

  private constructor() {}

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  async init() {
    await initDB(); // ✅ Initialize SQLite
    const dao = new VehicleDao(); // DAO now has access to the ready DB
    this.vehicleRepository = new LocalVehicleRepository(dao);
  }
}
