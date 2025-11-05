import { getDB } from "../database";
import {
  INSERT_CHARGE_TYPE,
  SELECT_ALL_CHARGE_TYPES,
  SELECT_CHARGE_TYPE_BY_ID,
  UPDATE_CHARGE_TYPE,
  DELETE_CHARGE_TYPE,
} from "../queries/ChargeTypeQueries";
import {
  ChargeType,
  NewChargeType,
  createChargeType,
} from "../../../domain/entities/ChargeType";
import { IChargeTypeDao } from "./IChargeTypeDao";

export class ChargeTypeDao implements IChargeTypeDao {
  private writeQueue: Promise<void> = Promise.resolve();

  async getAll(): Promise<ChargeType[]> {
    const db = await getDB();
    const stmt = await db.prepareAsync(SELECT_ALL_CHARGE_TYPES);

    try {
      const result = await stmt.executeAsync<ChargeType>();
      const rows = await result.getAllAsync();
      return rows as ChargeType[];
    } finally {
      await stmt.finalizeAsync();
    }
  }

  async getById(id: number): Promise<ChargeType | null> {
    const db = await getDB();
    const stmt = await db.prepareAsync(SELECT_CHARGE_TYPE_BY_ID);

    try {
      const result = await stmt.executeAsync([id]);
      const row = await result.getFirstAsync();
      return row ? (row as ChargeType) : null;
    } finally {
      await stmt.finalizeAsync();
    }
  }

  async insert(v: Partial<NewChargeType>): Promise<number> {
    return this.enqueueWrite(async () => {
      const db = await getDB();
      const stmt = await db.prepareAsync(INSERT_CHARGE_TYPE);
      const chargeType = createChargeType(v);
      let insertId = 0;

      try {
        await db.withTransactionAsync(async () => {
          const result = await stmt.executeAsync([
            chargeType.type,
            chargeType.selected,
          ]);
          insertId = result.lastInsertRowId ?? 0;
        });
      } finally {
        await stmt.finalizeAsync();
      }

      return insertId;
    });
  }

  async update(id: number, v: Partial<Omit<ChargeType, "id">>): Promise<void> {
    return this.enqueueWrite(async () => {
      const db = await getDB();
      const stmt = await db.prepareAsync(UPDATE_CHARGE_TYPE);

      try {
        const current = await this.getById(id);
        if (!current) throw new Error("Charge type not found");

        const chargeType = createChargeType({ ...current, ...v });
        await stmt.executeAsync([chargeType.type, chargeType.selected, id]);
      } finally {
        await stmt.finalizeAsync();
      }
    });
  }

  async delete(id: number): Promise<void> {
    return this.enqueueWrite(async () => {
      const db = await getDB();
      const stmt = await db.prepareAsync(DELETE_CHARGE_TYPE);

      try {
        await stmt.executeAsync([id]);
      } finally {
        await stmt.finalizeAsync();
      }
    });
  }

  private enqueueWrite<T>(fn: () => Promise<T>): Promise<T> {
    const result = this.writeQueue.then(() => fn());
    this.writeQueue = result.then(
      () => {},
      () => {}
    );
    return result;
  }
}
