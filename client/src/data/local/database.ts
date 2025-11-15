import * as SQLite from "expo-sqlite";
import { CREATE_VEHICLES_TABLE } from "./queries/VehicleQueries";
import { CREATE_PROVIDERS_TABLE } from "./queries/ProviderQueries";
import { CREATE_CHARGE_TYPES_TABLE } from "./queries/ChargeTypeQueries";
import { CREATE_CHARGING_STATIONS_TABLE } from "./queries/ChargingStationQueries";

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function initDB() {
  if (dbInstance) return dbInstance; // ✅ reuse connection

  const db = await SQLite.openDatabaseAsync("evo_route.db");

  try {
    // ✅ Run this OUTSIDE any transaction
    await db.execAsync("PRAGMA journal_mode = WAL;");

    await db.execAsync(CREATE_VEHICLES_TABLE);
    await db.execAsync(CREATE_PROVIDERS_TABLE);
    await db.execAsync(CREATE_CHARGE_TYPES_TABLE);
    await db.execAsync(CREATE_CHARGING_STATIONS_TABLE);

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
