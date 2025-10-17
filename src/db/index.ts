import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

export type RegistryDatabase = Database.Database;

const CREATE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS server_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  server_name TEXT NOT NULL,
  description TEXT NOT NULL,
  version TEXT NOT NULL,
  title TEXT,
  server_json TEXT NOT NULL,
  meta_json TEXT NOT NULL,
  published_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  is_latest INTEGER NOT NULL DEFAULT 0,
  search_text TEXT NOT NULL,
  UNIQUE(server_name, version)
);`;

const CREATE_INDEXES_SQL = [
  `CREATE INDEX IF NOT EXISTS idx_server_versions_name ON server_versions(server_name);`,
  `CREATE INDEX IF NOT EXISTS idx_server_versions_latest ON server_versions(is_latest);`,
  `CREATE INDEX IF NOT EXISTS idx_server_versions_updated_at ON server_versions(updated_at);`,
  `CREATE INDEX IF NOT EXISTS idx_server_versions_search ON server_versions(search_text);`,
];

export const createDatabase = (databasePath: string): RegistryDatabase => {
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  const db = new Database(databasePath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.prepare(CREATE_TABLE_SQL).run();
  for (const statement of CREATE_INDEXES_SQL) {
    db.prepare(statement).run();
  }
  return db;
};

