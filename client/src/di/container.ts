// src/di/Container.ts
import { initDB } from "../data/local/database";
import { VehicleDao } from "../data/local/dao/VehicleDao";
import { LocalVehicleRepository } from "../data/repositories/LocalVehicleRepository";
import { VehicleViewModel } from "../presentation/viewmodels/VehicleViewModel";

export class Container {
  public vehicleViewModel!: VehicleViewModel;

  private static instance: Container | null = null;

  private constructor() {} // private constructor prevents external instantiation

  static async getInstance(): Promise<Container> {
    if (!Container.instance) {
      const container = new Container();
      await container.init();
      Container.instance = container;
    }
    return Container.instance;
  }

  private async init() {
    await initDB(); // Initialize SQLite DB
    const dao = new VehicleDao();
    const repo = new LocalVehicleRepository(dao);
    this.vehicleViewModel = new VehicleViewModel(repo);
  }
}

// Exporting a single promise that resolves to the singleton container
export const containerPromise = Container.getInstance();
