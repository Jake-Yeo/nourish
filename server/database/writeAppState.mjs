import { databaseConnection } from './databaseConnection.mjs'
import { readAppState } from './readAppState.mjs'

export function writeAppState(applicationData) {
  databaseConnection.prepare(`
    INSERT INTO app_state (id, data, revision, updated_at) VALUES (1, ?, 1, ?)
    ON CONFLICT(id) DO UPDATE SET data = excluded.data, revision = app_state.revision + 1, updated_at = excluded.updated_at
  `).run(JSON.stringify(applicationData), Date.now())
  return readAppState()
}
