import { initDB } from "../data/local/database";

// --- DAOs ---
import { VehicleDao } from "../data/local/dao/VehicleDao";
import { ProviderDao } from "../data/local/dao/ProviderDao";
import { ChargeTypeDao } from "../data/local/dao/ChargeTypeDao";

// --- APIs ---
import { VehicleApi } from "../data/api/VehicleApi";

// --- Repositories ---
import { LocalVehicleRepository } from "../data/repositories/LocalVehicleRepository";
import { LocalProviderRepository } from "../data/repositories/LocalProviderRepository";
import { LocalChargeTypeRepository } from "../data/repositories/LocalChargeTypeRepository";
import { RemoteVehicleRepository } from "../data/repositories/RemoteVehicleRepository";

// --- ViewModels ---
import { VehicleViewModel } from "../presentation/viewmodels/VehicleViewModel";
import { ProviderViewModel } from "../presentation/viewmodels/ProviderViewModel";
import { ChargeTypeViewModel } from "../presentation/viewmodels/ChargeTypeViewModel";

export class Container {
  private static instance: Container | null = null;

  // Private fields for ViewModels
  private _vehicleViewModel: VehicleViewModel | null = null;
  private _providerViewModel: ProviderViewModel | null = null;
  private _chargeTypeViewModel: ChargeTypeViewModel | null = null;

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
    const chargeTypeDao = new ChargeTypeDao();

    // 3️⃣ Create repositories
    // Local repositories
    const localVehicleRepo = new LocalVehicleRepository(vehicleDao);
    const providerRepo = new LocalProviderRepository(providerDao);
    const chargeTypeRepo = new LocalChargeTypeRepository(chargeTypeDao);

    // Remote repositories
    const apiBaseUrl = null;
    const vehicleApi = new VehicleApi(apiBaseUrl, true);
    const remoteVehicleRepo = new RemoteVehicleRepository(vehicleApi);

    // 4️⃣ Create ViewModels
    // VehicleViewModel needs both local & remote repos
    this._vehicleViewModel = new VehicleViewModel(
      localVehicleRepo,
      remoteVehicleRepo
    );
    this._providerViewModel = new ProviderViewModel(providerRepo);
    this._chargeTypeViewModel = new ChargeTypeViewModel(chargeTypeRepo);
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

  get chargeTypeViewModel(): ChargeTypeViewModel {
    if (!this._chargeTypeViewModel) {
      throw new Error(
        "ChargeTypeViewModel not initialized. Call getInstance() first."
      );
    }
    return this._chargeTypeViewModel;
  }
}

// Export a single shared container promise
export const containerPromise: Promise<Container> = Container.getInstance();
