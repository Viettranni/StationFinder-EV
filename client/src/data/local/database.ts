import * as SQLite from "expo-sqlite";
import { CREATE_VEHICLES_TABLE } from "./queries/VehicleQueries";
import { CREATE_PROVIDERS_TABLE } from "./queries/ProviderQueries";

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function initDB() {
  if (dbInstance) return dbInstance; // ✅ Reuse existing connection

  const db = await SQLite.openDatabaseAsync("evo_route.db");

  try {
    await db.withTransactionAsync(async () => {
      await db.execAsync("PRAGMA journal_mode = WAL;");

      // ✅ Create both tables atomically (if one fails, both rollback)
      await db.execAsync(CREATE_VEHICLES_TABLE);
      await db.execAsync(CREATE_PROVIDERS_TABLE);
    });

    console.log("✅ Database initialized and all tables ready.");
  } catch (err) {
    console.error("❌ Database initialization failed:", err);
    throw err;
  }

  dbInstance = db;
  return dbInstance;
}

export async function getDB() {
  if (!dbInstance) {
    dbInstance = await initDB();
  }
  return dbInstance;
}
