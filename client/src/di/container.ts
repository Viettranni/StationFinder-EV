// src/di/Container.ts
import { initDB } from "../data/local/database";

// --- DAOs ---
import { VehicleDao } from "../data/local/dao/VehicleDao";
import { ProviderDao } from "../data/local/dao/ProviderDao";
//import { ChargeTypeDao } from "../data/local/dao/ChargeTypeDao";

// --- Repositories ---
import { LocalVehicleRepository } from "../data/repositories/LocalVehicleRepository";
import { LocalProviderRepository } from "../data/repositories/LocalProviderRepository";
//import { LocalChargeTypeRepository } from "../data/repositories/LocalChargeTypeRepository";

// --- ViewModels ---
import { VehicleViewModel } from "../presentation/viewmodels/VehicleViewModel";
import { ProviderViewModel } from "../presentation/viewmodels/ProviderViewModel";
//import { ChargeTypeViewModel } from "../presentation/viewmodels/ChargeTypeViewModel";

export class Container {
  private static instance: Container | null = null;

  // Private fields to ensure proper initialization
  private _vehicleViewModel: VehicleViewModel | null = null;
  private _providerViewModel: ProviderViewModel | null = null;
  //private _chargeTypeViewModel: ChargeTypeViewModel | null = null;

  private constructor() {}

  static async getInstance(): Promise<Container> {
    if (!Container.instance) {
      const container = new Container();
      await container.init();
      Container.instance = container;
    }
    return Container.instance;
  }

  private async init(): Promise<void> {
    // 1️⃣ Initialize local SQLite DB
    await initDB();

    // 2️⃣ Create DAOs
    const vehicleDao = new VehicleDao();
    const providerDao = new ProviderDao();
    //const chargeTypeDao = new ChargeTypeDao();

    // 3️⃣ Create repositories
    const vehicleRepo = new LocalVehicleRepository(vehicleDao);
    const providerRepo = new LocalProviderRepository(providerDao);
    //const chargeTypeRepo = new LocalChargeTypeRepository(chargeTypeDao);

    // 4️⃣ Create viewmodels
    this._vehicleViewModel = new VehicleViewModel(vehicleRepo);
    this._providerViewModel = new ProviderViewModel(providerRepo);
    //this._chargeTypeViewModel = new ChargeTypeViewModel(chargeTypeRepo);
  }

  // 5️⃣ Safe getters
  get vehicleViewModel(): VehicleViewModel {
    if (!this._vehicleViewModel) {
      throw new Error(
        "VehicleViewModel not initialized. Call getInstance() first."
      );
    }
    return this._vehicleViewModel;
  }

  get providerViewModel(): ProviderViewModel {
    if (!this._providerViewModel) {
      throw new Error(
        "ProviderViewModel not initialized. Call getInstance() first."
      );
    }
    return this._providerViewModel;
  }

  // get chargeTypeViewModel(): ChargeTypeViewModel {
  //   if (!this._chargeTypeViewModel) {
  //     throw new Error(
  //       "ChargeTypeViewModel not initialized. Call getInstance() first."
  //     );
  //   }
  //   return this._chargeTypeViewModel;
  // }
}

// Exporting a single shared container promise
export const containerPromise: Promise<Container> = Container.getInstance();
