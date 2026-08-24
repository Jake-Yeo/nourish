import test from 'node:test'
import assert from 'node:assert/strict'
import { DatabaseSync } from 'node:sqlite'
import { initializeSavedMealSchema, savePhotoMeal, getPhotoStorageUsage, clearSavedPhotos } from '../server/database/savedMealStore.mjs'

function fixture() {
  const database = new DatabaseSync(':memory:')
  database.exec('CREATE TABLE app_state (id INTEGER PRIMARY KEY, data TEXT NOT NULL, revision INTEGER NOT NULL, updated_at INTEGER NOT NULL)')
  const data = { entries: [{ id: 'old', source: 'nourish-manual' }], goals: { calories: 2000 } }
  database.prepare('INSERT INTO app_state VALUES (1, ?, 1, 1)').run(JSON.stringify(data))
  initializeSavedMealSchema(database)
  return database
}

test('persists photos, notes, links, and reports actual data URL bytes', () => {
  const database = fixture()
  savePhotoMeal(database, { mealId: 'meal-1', entryIds: ['photo-entry'], photos: [{ id: 'photo-1', dataUrl: 'data:image/jpeg;base64,YQ==', note: 'half eaten' }], mealNote: 'Dinner' })
  assert.deepEqual(getPhotoStorageUsage(database), { bytes: Buffer.byteLength('data:image/jpeg;base64,YQ=='), photoCount: 1, mealCount: 1 })
  assert.equal(database.prepare('SELECT note FROM saved_meal_photos').get().note, 'half eaten')
  assert.equal(database.prepare('SELECT entry_id FROM saved_meal_entries').get().entry_id, 'photo-entry')
})

test('clear photos preserves app state diary entries and goals', () => {
  const database = fixture()
  savePhotoMeal(database, { mealId: 'meal-1', entryIds: ['photo-entry'], photos: [{ id: 'photo-1', dataUrl: 'data:image/jpeg;base64,YQ==', note: 'note' }], mealNote: '' })
  clearSavedPhotos(database)
  assert.deepEqual(getPhotoStorageUsage(database), { bytes: 0, photoCount: 0, mealCount: 0 })
  assert.deepEqual(JSON.parse(database.prepare('SELECT data FROM app_state').get().data), { entries: [{ id: 'old', source: 'nourish-manual' }], goals: { calories: 2000 } })
})
