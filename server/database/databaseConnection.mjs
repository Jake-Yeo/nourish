import fs from 'node:fs/promises'
import path from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { dataDirectory } from '../config/projectPaths.mjs'
import '../config/loadEnvironment.mjs'

await fs.mkdir(dataDirectory, { recursive: true })
export const databaseConnection = new DatabaseSync(process.env.NOURISH_DATABASE_PATH || path.join(dataDirectory, 'nourish.sqlite'))
databaseConnection.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA synchronous = FULL;
  CREATE TABLE IF NOT EXISTS app_state (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    data TEXT NOT NULL,
    revision INTEGER NOT NULL DEFAULT 1,
    updated_at INTEGER NOT NULL
  );
`)
