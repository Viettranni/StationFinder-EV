import * as SQLite from "expo-sqlite";
import { CREATE_VEHICLES_TABLE } from "./queries";

// Define the shape of a row in the vehicles table
export interface Vehicle {
  id: number;
  brand: string;
  model: string;
  year: number;
  batterySizeKwh: number;
  currentBatteryState: number;
  averageConsumption: number;
  latitude: number;
  longitude: number;
  favourites: string;
  createdAt: string;
}

export async function initDB() {
  const db = await SQLite.openDatabaseAsync("evo_route.db");

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    ${CREATE_VEHICLES_TABLE}
  `);

  console.log("✅ Database initialized and vehicles table ready.");

  // Safely check if the table is empty
  const countRow = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM vehicles"
  );

  const vehicleCount = countRow?.count ?? 0;

  if (vehicleCount === 0) {
    await db.runAsync(
      `INSERT INTO vehicles (
        brand, model, year, batterySizeKwh, currentBatteryState,
        averageConsumption, latitude, longitude, favourites, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      "Tesla",
      "Model 3",
      2023,
      75,
      90,
      15.2,
      37.7749,
      -122.4194,
      "false",
      new Date().toISOString()
    );
    console.log("🚗 Inserted sample vehicle.");
  }

  // Fetch first vehicle (typed)
  const firstVehicle = await db.getFirstAsync<Vehicle>(
    "SELECT * FROM vehicles"
  );
  if (firstVehicle) {
    console.log("🔍 First vehicle:", firstVehicle);
  } else {
    console.log("⚠️ No vehicles found.");
  }

  // Fetch all vehicles (typed)
  const allVehicles = await db.getAllAsync<Vehicle>("SELECT * FROM vehicles");

  console.log("📋 All vehicles:");
  for (const v of allVehicles) {
    console.log(
      `#${v.id} ${v.brand} ${v.model} (${v.year}) - Battery: ${v.batterySizeKwh}kWh, Favourite: ${v.favourites}`
    );
  }

  return db;
}

// import * as SQLite from "expo-sqlite";
// import { CREATE_VEHICLES_TABLE } from "./queries";

// export interface Vehicle {
//   id: number;
//   brand: string;
//   model: string;
//   year: number;
//   batterySizeKwh: number;
//   currentBatteryState: number;
//   averageConsumption: number;
//   latitude: number;
//   longitude: number;
//   favourites: string;
//   createdAt: string;
// }

// export async function initDB() {
//   const db = await SQLite.openDatabaseAsync("evo_route.db");

//   await db.execAsync(`
//     PRAGMA journal_mode = WAL;
//     ${CREATE_VEHICLES_TABLE}
//   `);

//   const countRow = await db.getFirstAsync<{ count: number }>(
//     "SELECT COUNT(*) as count FROM vehicles"
//   );
//   const vehicleCount = countRow?.count ?? 0;

//   if (vehicleCount === 0) {
//     await db.runAsync(
//       `INSERT INTO vehicles (
//         brand, model, year, batterySizeKwh, currentBatteryState,
//         averageConsumption, latitude, longitude, favourites, createdAt
//       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//       "Tesla",
//       "Model 3",
//       2023,
//       75,
//       90,
//       15.2,
//       37.7749,
//       -122.4194,
//       "false",
//       new Date().toISOString()
//     );
//   }

//   return db;
// }
