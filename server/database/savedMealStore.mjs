export function initializeSavedMealSchema(database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS saved_meals (id TEXT PRIMARY KEY, meal_note TEXT NOT NULL DEFAULT '', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS saved_meal_photos (id TEXT PRIMARY KEY, meal_id TEXT NOT NULL REFERENCES saved_meals(id) ON DELETE CASCADE, position INTEGER NOT NULL, data_url TEXT NOT NULL, note TEXT NOT NULL DEFAULT '');
    CREATE TABLE IF NOT EXISTS saved_meal_entries (meal_id TEXT NOT NULL REFERENCES saved_meals(id) ON DELETE CASCADE, entry_id TEXT NOT NULL UNIQUE, PRIMARY KEY (meal_id, entry_id));
    CREATE TABLE IF NOT EXISTS saved_meal_items (id TEXT PRIMARY KEY, meal_id TEXT NOT NULL REFERENCES saved_meals(id) ON DELETE CASCADE, entry_id TEXT NOT NULL UNIQUE, position INTEGER NOT NULL, name TEXT NOT NULL, description TEXT NOT NULL DEFAULT '');
    CREATE TABLE IF NOT EXISTS saved_item_photos (item_id TEXT NOT NULL REFERENCES saved_meal_items(id) ON DELETE CASCADE, photo_id TEXT NOT NULL UNIQUE REFERENCES saved_meal_photos(id) ON DELETE CASCADE, position INTEGER NOT NULL, PRIMARY KEY (item_id, photo_id));
    CREATE INDEX IF NOT EXISTS saved_meal_photos_meal ON saved_meal_photos(meal_id, position);
    CREATE INDEX IF NOT EXISTS saved_meal_items_meal ON saved_meal_items(meal_id, position);
  `)
}

export function inTransaction(database, operation) {
  database.exec('BEGIN IMMEDIATE')
  try { const result = operation(); database.exec('COMMIT'); return result }
  catch (error) { database.exec('ROLLBACK'); throw error }
}

export function getPhotoStorageUsage(database) {
  const row = database.prepare('SELECT COALESCE(SUM(length(CAST(data_url AS BLOB))), 0) bytes, COUNT(*) photoCount, COUNT(DISTINCT meal_id) mealCount FROM saved_meal_photos').get()
  return { bytes: Number(row.bytes), photoCount: Number(row.photoCount), mealCount: Number(row.mealCount) }
}

function readPhotos(database, query, id) { return database.prepare(query).all(id) }

export function getSavedMealForEntry(database, entryId) {
  const item = database.prepare(`SELECT i.id, i.meal_id mealId, i.entry_id entryId, i.name, i.description, m.meal_note mealNote FROM saved_meal_items i JOIN saved_meals m ON m.id = i.meal_id WHERE i.entry_id = ?`).get(entryId)
  if (item) {
    const photos = readPhotos(database, `SELECT p.id, p.data_url dataUrl, p.note FROM saved_item_photos l JOIN saved_meal_photos p ON p.id = l.photo_id WHERE l.item_id = ? ORDER BY l.position`, item.id)
    return { id: item.mealId, mealNote: item.mealNote, items: [{ id: item.id, entryId: item.entryId, name: item.name, description: item.description, photos }] }
  }
  const meal = database.prepare(`SELECT m.id, m.meal_note mealNote FROM saved_meals m JOIN saved_meal_entries e ON e.meal_id = m.id WHERE e.entry_id = ?`).get(entryId)
  if (!meal) return null
  const legacyPhotos = readPhotos(database, 'SELECT id, data_url dataUrl, note FROM saved_meal_photos WHERE meal_id = ? ORDER BY position', meal.id)
  return { ...meal, items: [], legacyPhotos, readOnlyLegacy: true }
}

export function updateSavedItemNotes(database, mealId, item) {
  return inTransaction(database, () => {
    const owned = database.prepare('SELECT id FROM saved_meal_items WHERE id = ? AND meal_id = ?').get(item.id, mealId)
    if (!owned) throw new Error('Saved food item was not found.')
    database.prepare('UPDATE saved_meal_items SET name = ?, description = ? WHERE id = ? AND meal_id = ?').run(item.name, item.description, item.id, mealId)
    const update = database.prepare('UPDATE saved_meal_photos SET note = ? WHERE id = ? AND EXISTS (SELECT 1 FROM saved_item_photos WHERE item_id = ? AND photo_id = ?)')
    item.photos.forEach(photo => update.run(photo.note, photo.id, item.id, photo.id))
    database.prepare('UPDATE saved_meals SET updated_at = ? WHERE id = ?').run(Date.now(), mealId)
  })
}

export function clearSavedPhotos(database) { return inTransaction(database, () => database.prepare('DELETE FROM saved_meals').run()) }
