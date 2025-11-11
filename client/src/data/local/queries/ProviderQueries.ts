// PROVIDERS TABLE
export const CREATE_PROVIDERS_TABLE = `
  CREATE TABLE IF NOT EXISTS providers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    selected TEXT NOT NULL DEFAULT 'false' -- 'true' or 'false'
  );
`;

export const INSERT_PROVIDER = `
  INSERT INTO providers (name, selected)
  VALUES (?, ?);
`;

export const SELECT_ALL_PROVIDERS = `
  SELECT * FROM providers ORDER BY name ASC;
`;

export const SELECT_PROVIDER_BY_ID = `
  SELECT * FROM providers WHERE id = ?;
`;

export const UPDATE_PROVIDER = `
  UPDATE providers
  SET name = ?,
      selected = ?
  WHERE id = ?;
`;

export const DELETE_PROVIDER = `
  DELETE FROM providers WHERE id = ?;
`;
