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

  private _vehicleDao?: VehicleDao;
  private _providerDao?: ProviderDao;
  private _chargeTypeDao?: ChargeTypeDao;

  private _vehicleViewModel?: VehicleViewModel;
  private _providerViewModel?: ProviderViewModel;
  private _chargeTypeViewModel?: ChargeTypeViewModel;

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
  }

  /** Lazy-loaded VehicleViewModel (typesafe) */
  get vehicleViewModel(): VehicleViewModel {
    if (!this._vehicleDao) {
      throw new Error("DAOs not initialized yet");
    }
    if (!this._vehicleViewModel) {
      console.log("[Container] Initializing VehicleViewModel...");
      const localRepo = new LocalVehicleRepository(this._vehicleDao);
      const remoteRepo = new RemoteVehicleRepository(
        new VehicleApi(null, true)
      );
      this._vehicleViewModel = new VehicleViewModel(localRepo, remoteRepo);
      console.log("[Container] VehicleViewModel initialized");
    }
    return this._vehicleViewModel;
  }

  /** Lazy-loaded ProviderViewModel (typesafe) */
  get providerViewModel(): ProviderViewModel {
    if (!this._providerDao) {
      throw new Error("DAOs not initialized yet");
    }
    if (!this._providerViewModel) {
      console.log("[Container] Initializing ProviderViewModel...");
      const repo = new LocalProviderRepository(this._providerDao);
      this._providerViewModel = new ProviderViewModel(repo);
      console.log("[Container] ProviderViewModel initialized");
    }
    return this._providerViewModel;
  }

  /** Lazy-loaded ChargeTypeViewModel (typesafe) */
  get chargeTypeViewModel(): ChargeTypeViewModel {
    if (!this._chargeTypeDao) {
      throw new Error("DAOs not initialized yet");
    }
    if (!this._chargeTypeViewModel) {
      console.log("[Container] Initializing ChargeTypeViewModel...");
      const repo = new LocalChargeTypeRepository(this._chargeTypeDao);
      this._chargeTypeViewModel = new ChargeTypeViewModel(repo);
      console.log("[Container] ChargeTypeViewModel initialized");
    }
    return this._chargeTypeViewModel;
  }
}

/** Export a single shared container promise */
export const containerPromise: Promise<Container> = Container.getInstance();
