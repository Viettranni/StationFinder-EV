import { getDB } from "../database";
import {
  INSERT_CHARGING_STATION,
  SELECT_ALL_CHARGING_STATIONS,
  SELECT_CHARGING_STATION_BY_ID,
  UPDATE_CHARGING_STATION,
  DELETE_CHARGING_STATION,
} from "../queries/ChargingStationQueries";
import {
  ChargingStation,
  NewChargingStation,
  createChargingStation,
} from "../../../domain/entities/ChargingStation";
import { IChargingStationDao } from "./IChargingStationDao";

export class ChargingStationDao implements IChargingStationDao {
  private writeQueue: Promise<void> = Promise.resolve();

  async getAll(): Promise<ChargingStation[]> {
    const db = await getDB();
    const statement = await db.prepareAsync(SELECT_ALL_CHARGING_STATIONS);

    try {
      const result = await statement.executeAsync<ChargingStation>();
      const rows = await result.getAllAsync();
      return rows as ChargingStation[];
    } finally {
      await statement.finalizeAsync();
    }
  }

  async getById(id: number): Promise<ChargingStation | null> {
    const db = await getDB();
    const statement = await db.prepareAsync(SELECT_CHARGING_STATION_BY_ID);

    try {
      const result = await statement.executeAsync([id]);
      const row = await result.getFirstAsync();
      return row ? (row as ChargingStation) : null;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async insert(s: Partial<NewChargingStation>): Promise<number> {
    return this.enqueueWrite(async () => {
      const db = await getDB();
      const statement = await db.prepareAsync(INSERT_CHARGING_STATION);
      let insertId = 0;

      const station = createChargingStation(s);

      try {
        await db.withTransactionAsync(async () => {
          const result = await statement.executeAsync([
            station.acmId,
            station.stationName,
            station.address,
            station.latitude,
            station.longitude,
            station.amountCCS,
            station.amountCHAdeMO,
            station.amountType2,
            station.statusType,
            station.openingHours,
            station.photos,
            station.comments,
            station.createdAt,
            station.updatedAt,
          ]);
          insertId = result.lastInsertRowId ?? 0;
        });
      } finally {
        await statement.finalizeAsync();
      }

      return insertId;
    });
  }

  async update(
    id: number,
    s: Partial<Omit<ChargingStation, "id">>
  ): Promise<void> {
    return this.enqueueWrite(async () => {
      const db = await getDB();
      const statement = await db.prepareAsync(UPDATE_CHARGING_STATION);

      try {
        await db.withTransactionAsync(async () => {
          const current = await this.getById(id);
          if (!current) throw new Error("Charging station not found");

          const station = createChargingStation({ ...current, ...s });

          await statement.executeAsync([
            station.acmId,
            station.stationName,
            station.address,
            station.latitude,
            station.longitude,
            station.amountCCS,
            station.amountCHAdeMO,
            station.amountType2,
            station.statusType,
            station.openingHours,
            station.photos,
            station.comments,
            station.updatedAt,
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
      const statement = await db.prepareAsync(DELETE_CHARGING_STATION);

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
