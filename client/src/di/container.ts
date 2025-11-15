import { initDB } from "../data/local/database";

// --- DAOs ---
import { VehicleDao } from "../data/local/dao/VehicleDao";
import { ProviderDao } from "../data/local/dao/ProviderDao";
import { ChargeTypeDao } from "../data/local/dao/ChargeTypeDao";
import { ChargingStationDao } from "../data/local/dao/ChargingStationDao";

// --- APIs ---
import { VehicleApi } from "../data/api/VehicleApi";

// --- Repositories ---
import { LocalVehicleRepository } from "../data/repositories/LocalVehicleRepository";
import { LocalProviderRepository } from "../data/repositories/LocalProviderRepository";
import { LocalChargeTypeRepository } from "../data/repositories/LocalChargeTypeRepository";
import { LocalChargingStationRepository } from "../data/repositories/LocalChargingStationRepository";
import { RemoteVehicleRepository } from "../data/repositories/RemoteVehicleRepository";
import { RemoteChargingStationRepository } from "../data/repositories/RemoteChargingStationRepository";

// --- ViewModels ---
import { VehicleViewModel } from "../presentation/viewmodels/VehicleViewModel";
import { ProviderViewModel } from "../presentation/viewmodels/ProviderViewModel";
import { ChargeTypeViewModel } from "../presentation/viewmodels/ChargeTypeViewModel";
import { ChargingStationViewModel } from "../presentation/viewmodels/ChargingStationViewModel";
import { ChargingStationApi } from "../data/api/ChargingStationApi";

export class Container {
  private static instance: Container | null = null;

  private _vehicleDao?: VehicleDao;
  private _providerDao?: ProviderDao;
  private _chargeTypeDao?: ChargeTypeDao;
  private _chargingStationDao?: ChargingStationDao;

  private _vehicleViewModel?: VehicleViewModel;
  private _providerViewModel?: ProviderViewModel;
  private _chargeTypeViewModel?: ChargeTypeViewModel;
  private _chargingStationViewModel?: ChargingStationViewModel;

  private constructor() {}

  /** Returns the singleton container instance, initializing DB/DAOs first */
  static async getInstance(): Promise<Container> {
    if (!Container.instance) {
      const container = new Container();
      await container.init();
      Container.instance = container;
    }
    return Container.instance;
  }

  /** Initialize the database and DAOs */
  private async init(): Promise<void> {
    console.log("[Container] Initializing database...");
    await initDB();

    this._vehicleDao = new VehicleDao();
    console.log("[Container] VehicleDao initialized");

    this._providerDao = new ProviderDao();
    console.log("[Container] ProviderDao initialized");

    this._chargeTypeDao = new ChargeTypeDao();
    console.log("[Container] ChargeTypeDao initialized");

    this._chargingStationDao = new ChargingStationDao();
    console.log("[Container] ChargingStationDao initialized");
  }

  /** Lazy-loaded VehicleViewModel */
  get vehicleViewModel(): VehicleViewModel {
    if (!this._vehicleDao) throw new Error("DAOs not initialized yet");
    if (!this._vehicleViewModel) {
      const localRepo = new LocalVehicleRepository(this._vehicleDao);
      const remoteRepo = new RemoteVehicleRepository(
        new VehicleApi(null, true)
      );
      this._vehicleViewModel = new VehicleViewModel(localRepo, remoteRepo);
    }
    return this._vehicleViewModel;
  }

  /** Lazy-loaded ProviderViewModel */
  get providerViewModel(): ProviderViewModel {
    if (!this._providerDao) throw new Error("DAOs not initialized yet");
    if (!this._providerViewModel) {
      const repo = new LocalProviderRepository(this._providerDao);
      this._providerViewModel = new ProviderViewModel(repo);
    }
    return this._providerViewModel;
  }

  /** Lazy-loaded ChargeTypeViewModel */
  get chargeTypeViewModel(): ChargeTypeViewModel {
    if (!this._chargeTypeDao) throw new Error("DAOs not initialized yet");
    if (!this._chargeTypeViewModel) {
      const repo = new LocalChargeTypeRepository(this._chargeTypeDao);
      this._chargeTypeViewModel = new ChargeTypeViewModel(repo);
    }
    return this._chargeTypeViewModel;
  }

  /** Lazy-loaded ChargingStationViewModel */
  get chargingStationViewModel(): ChargingStationViewModel {
    if (!this._chargingStationDao || !this._chargeTypeDao)
      throw new Error("DAOs not initialized yet");

    if (!this._chargingStationViewModel) {
      const localRepo = new LocalChargingStationRepository(
        this._chargingStationDao
      );
      const remoteRepo = new RemoteChargingStationRepository(
        new ChargingStationApi(null, true)
      );
      const chargeTypeRepo = new LocalChargeTypeRepository(this._chargeTypeDao);

      this._chargingStationViewModel = new ChargingStationViewModel(
        localRepo,
        remoteRepo,
        chargeTypeRepo
      );
    }

    return this._chargingStationViewModel;
  }
}

/** Export a single shared container promise */
export const containerPromise: Promise<Container> = Container.getInstance();
