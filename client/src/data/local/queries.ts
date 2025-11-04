// src/data/local/queries.ts
export const CREATE_VEHICLES_TABLE = `
  CREATE TABLE IF NOT EXISTS vehicles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER,
    batterySizeKwh INTEGER,
    currentBatteryState INTEGER,
    averageConsumption REAL,
    latitude REAL,
    longitude REAL,
    favourites TEXT NOT NULL,
    createdAt TEXT NOT NULL
  );
`;

export const INSERT_VEHICLE = `
  INSERT INTO vehicles (
    brand,
    model,
    year,
    batterySizeKwh,
    currentBatteryState,
    averageConsumption,
    latitude,
    longitude,
    favourites,
    createdAt
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
`;

export const SELECT_ALL_VEHICLES = `
  SELECT * FROM vehicles ORDER BY id DESC;
`;

export const SELECT_VEHICLE_BY_ID = `
  SELECT * FROM vehicles WHERE id = ?;
`;

export const UPDATE_VEHICLE = `
  UPDATE vehicles
  SET brand = ?,
      model = ?,
      year = ?,
      batterySizeKwh = ?,
      currentBatteryState = ?,
      averageConsumption = ?,
      latitude = ?,
      longitude = ?,
      favourites = ?
  WHERE id = ?;
`;

export const DELETE_VEHICLE = `
  DELETE FROM vehicles WHERE id = ?;
`;
