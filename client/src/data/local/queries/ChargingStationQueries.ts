export const CREATE_CHARGING_STATIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS charging_stations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    acmId INTEGER,
    stationName TEXT NOT NULL,
    address TEXT,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    amountCCS INTEGER,
    amountCHAdeMO INTEGER,
    amountType2 INTEGER,
    statusType TEXT,
    openingHours TEXT,
    photos TEXT,
    comments TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );
`;

export const INSERT_CHARGING_STATION = `
  INSERT INTO charging_stations (
    acmId,
    stationName,
    address,
    latitude,
    longitude,
    amountCCS,
    amountCHAdeMO,
    amountType2,
    statusType,
    openingHours,
    photos,
    comments,
    createdAt,
    updatedAt
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
`;

export const SELECT_ALL_CHARGING_STATIONS = `
  SELECT * FROM charging_stations ORDER BY id DESC;
`;

export const SELECT_CHARGING_STATION_BY_ID = `
  SELECT * FROM charging_stations WHERE id = ?;
`;

export const UPDATE_CHARGING_STATION = `
  UPDATE charging_stations
  SET acmId = ?,
      stationName = ?,
      address = ?,
      latitude = ?,
      longitude = ?,
      amountCCS = ?,
      amountCHAdeMO = ?,
      amountType2 = ?,
      statusType = ?,
      openingHours = ?,
      photos = ?,
      comments = ?,
      updatedAt = ?
  WHERE id = ?;
`;

export const DELETE_CHARGING_STATION = `
  DELETE FROM charging_stations WHERE id = ?;
`;
