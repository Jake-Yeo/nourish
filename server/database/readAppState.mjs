import { databaseConnection } from './databaseConnection.mjs'

export function readAppState() {
  const storedState = databaseConnection.prepare('SELECT data, revision FROM app_state WHERE id = 1').get()
  return storedState ? { data: JSON.parse(storedState.data), revision: Number(storedState.revision) } : null
}
