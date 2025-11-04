// src/data/local/database.ts
import * as SQLite from "expo-sqlite";
import { CREATE_VEHICLES_TABLE } from "./queries";

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function initDB() {
  if (dbInstance) return dbInstance; // ✅ reuse existing connection

  const db = await SQLite.openDatabaseAsync("evo_route.db");
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    ${CREATE_VEHICLES_TABLE}
  `);
  console.log("✅ Database initialized and vehicles table ready.");

  dbInstance = db;
  return dbInstance;
}

export async function getDB() {
  if (!dbInstance) {
    dbInstance = await initDB();
  }
  return dbInstance;
}
