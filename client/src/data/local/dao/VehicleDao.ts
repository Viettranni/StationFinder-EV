// src/data/dao/VehicleDao.ts
import { getDB } from "../database";
import {
  INSERT_VEHICLE,
  SELECT_ALL_VEHICLES,
  SELECT_VEHICLE_BY_ID,
  UPDATE_VEHICLE,
  DELETE_VEHICLE,
} from "../queries/VehicleQueries";
import {
  Vehicle,
  NewVehicle,
  createVehicle,
} from "../../../domain/entities/Vehicle";
import { IVehicleDao } from "./IVehicleDao";

export class VehicleDao implements IVehicleDao {
  private writeQueue: Promise<void> = Promise.resolve();

  async getAll(): Promise<Vehicle[]> {
    const db = await getDB();
    const statement = await db.prepareAsync(SELECT_ALL_VEHICLES);

    try {
      const result = await statement.executeAsync<Vehicle>();
      const rows = await result.getAllAsync();
      return rows as Vehicle[];
    } finally {
      await statement.finalizeAsync();
    }
  }

  async getById(id: number): Promise<Vehicle | null> {
    const db = await getDB();
    const statement = await db.prepareAsync(SELECT_VEHICLE_BY_ID);

    try {
      const result = await statement.executeAsync([id]);
      const row = await result.getFirstAsync();
      return row ? (row as Vehicle) : null;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async insert(v: Partial<NewVehicle>): Promise<number> {
    return this.enqueueWrite(async () => {
      const db = await getDB();
      const statement = await db.prepareAsync(INSERT_VEHICLE);
      let insertId = 0;

      const vehicle = createVehicle(v);

      try {
        await db.withTransactionAsync(async () => {
          const result = await statement.executeAsync([
            vehicle.brand,
            vehicle.model,
            vehicle.year,
            vehicle.batterySizeKwh,
            vehicle.maxChargingSpeed_kW ?? 0, // ✅ Add charging speed
            vehicle.currentBatteryState,
            vehicle.averageConsumption,
            vehicle.latitude,
            vehicle.longitude,
            vehicle.favourites,
            vehicle.createdAt,
          ]);
          insertId = result.lastInsertRowId ?? 0;
        });
      } finally {
        await statement.finalizeAsync();
      }

      return insertId;
    });
  }

  async update(id: number, v: Partial<Omit<Vehicle, "id">>): Promise<void> {
    return this.enqueueWrite(async () => {
      const db = await getDB();
      const statement = await db.prepareAsync(UPDATE_VEHICLE);

      try {
        await db.withTransactionAsync(async () => {
          const current = await this.getById(id);
          if (!current) throw new Error("Vehicle not found");

          const vehicle = createVehicle({ ...current, ...v });

          await statement.executeAsync([
            vehicle.brand,
            vehicle.model,
            vehicle.year,
            vehicle.batterySizeKwh,
            vehicle.maxChargingSpeed_kW ?? 0, // ✅ Add charging speed
            vehicle.currentBatteryState,
            vehicle.averageConsumption,
            vehicle.latitude,
            vehicle.longitude,
            vehicle.favourites,
            id,
          ]);
        });
      } finally {
        await statement.finalizeAsync();
      }
    });
  }

  async delete(id: number): Promise<void> {
    return this.enqueueWrite(async () => {
      const db = await getDB();
      const statement = await db.prepareAsync(DELETE_VEHICLE);

      try {
        await db.withTransactionAsync(async () => {
          await statement.executeAsync([id]);
        });
      } finally {
        await statement.finalizeAsync();
      }
    });
  }

  private enqueueWrite<T>(fn: () => Promise<T>): Promise<T> {
    const resultPromise = this.writeQueue.then(() => fn());
    this.writeQueue = resultPromise.then(
      () => {},
      () => {}
    );
    return resultPromise;
  }
}
