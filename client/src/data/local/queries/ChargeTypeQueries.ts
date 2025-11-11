export const CREATE_CHARGE_TYPES_TABLE = `
  CREATE TABLE IF NOT EXISTS charge_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL UNIQUE,
    selected TEXT NOT NULL DEFAULT 'false'
  );
`;

export const INSERT_CHARGE_TYPE = `
  INSERT INTO charge_types (type, selected)
  VALUES (?, ?);
`;

export const SELECT_ALL_CHARGE_TYPES = `
  SELECT * FROM charge_types ORDER BY type ASC;
`;

export const SELECT_CHARGE_TYPE_BY_ID = `
  SELECT * FROM charge_types WHERE id = ?;
`;

export const UPDATE_CHARGE_TYPE = `
  UPDATE charge_types
  SET type = ?, selected = ?
  WHERE id = ?;
`;

export const DELETE_CHARGE_TYPE = `
  DELETE FROM charge_types WHERE id = ?;
`;
