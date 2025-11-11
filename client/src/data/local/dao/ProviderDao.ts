import { getDB } from "../database";
import {
  INSERT_PROVIDER,
  SELECT_ALL_PROVIDERS,
  SELECT_PROVIDER_BY_ID,
  UPDATE_PROVIDER,
  DELETE_PROVIDER,
} from "../queries/ProviderQueries";
import {
  Provider,
  NewProvider,
  createProvider,
} from "../../../domain/entities/Provider";
import { IProviderDao } from "./IProviderDao";

export class ProviderDao implements IProviderDao {
  private writeQueue: Promise<void> = Promise.resolve();

  async getAll(): Promise<Provider[]> {
    const db = await getDB();
    const stmt = await db.prepareAsync(SELECT_ALL_PROVIDERS);

    try {
      const result = await stmt.executeAsync<Provider>();
      const rows = await result.getAllAsync();
      return rows as Provider[];
    } finally {
      await stmt.finalizeAsync();
    }
  }

  async getById(id: number): Promise<Provider | null> {
    const db = await getDB();
    const stmt = await db.prepareAsync(SELECT_PROVIDER_BY_ID);

    try {
      const result = await stmt.executeAsync([id]);
      const row = await result.getFirstAsync();
      return row ? (row as Provider) : null;
    } finally {
      await stmt.finalizeAsync();
    }
  }

  async insert(v: Partial<NewProvider>): Promise<number> {
    return this.enqueueWrite(async () => {
      const db = await getDB();
      const stmt = await db.prepareAsync(INSERT_PROVIDER);
      const provider = createProvider(v);
      let insertId = 0;

      try {
        await db.withTransactionAsync(async () => {
          const result = await stmt.executeAsync([
            provider.name,
            provider.selected,
          ]);
          insertId = result.lastInsertRowId ?? 0;
        });
      } finally {
        await stmt.finalizeAsync();
      }

      return insertId;
    });
  }

  async update(id: number, v: Partial<Omit<Provider, "id">>): Promise<void> {
    return this.enqueueWrite(async () => {
      const db = await getDB();
      const stmt = await db.prepareAsync(UPDATE_PROVIDER);

      try {
        const current = await this.getById(id);
        if (!current) throw new Error("Provider not found");

        const provider = createProvider({ ...current, ...v });
        await stmt.executeAsync([provider.name, provider.selected, id]);
      } finally {
        await stmt.finalizeAsync();
      }
    });
  }

  async delete(id: number): Promise<void> {
    return this.enqueueWrite(async () => {
      const db = await getDB();
      const stmt = await db.prepareAsync(DELETE_PROVIDER);

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
