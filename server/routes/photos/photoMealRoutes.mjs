import { databaseConnection } from '../../database/databaseConnection.mjs'
import { clearSavedPhotos, getPhotoStorageUsage, getSavedMealForEntry, inTransaction, updateSavedItemNotes } from '../../database/savedMealStore.mjs'
import { readAppState } from '../../database/readAppState.mjs'
import { validateItemUpdate, validatePhotoMeal } from './validatePhotoMeal.mjs'
import { linkAnalysisJobToMeal } from '../../database/analysisJobStore.mjs'
import { getAnalysisJob } from '../../database/analysisJobStore.mjs'
import { updateLoggedAnalysisMeal } from '../../database/loggedAnalysisMealStore.mjs'

function writeState(data) { databaseConnection.prepare('UPDATE app_state SET data = ?, revision = revision + 1, updated_at = ? WHERE id = 1').run(JSON.stringify(data), Date.now()) }
function responseError(response, status, error) { return response.status(status).json({ error }) }
function hasEntryId(entries, proposed, ignored = new Set()) { const ids = new Set(entries.filter(entry => !ignored.has(entry.id)).map(entry => entry.id)); return proposed.some(entry => ids.has(entry.id)) }
function itemPhotoIds(itemId) { return databaseConnection.prepare('SELECT photo_id id FROM saved_item_photos WHERE item_id = ?').all(itemId).map(row => row.id) }
function matchingPhotos(item) { const stored = itemPhotoIds(item.id); return stored.length === item.photos.length && item.photos.every(photo => stored.includes(photo.id)) }

function insertMeal(body) {
  const now = Date.now()
  databaseConnection.prepare('INSERT INTO saved_meals VALUES (?, ?, ?, ?)').run(body.mealId, body.mealNote || '', now, now)
  const photo = databaseConnection.prepare('INSERT INTO saved_meal_photos VALUES (?, ?, ?, ?, ?)')
  const entry = databaseConnection.prepare('INSERT INTO saved_meal_entries VALUES (?, ?)')
  const item = databaseConnection.prepare('INSERT INTO saved_meal_items VALUES (?, ?, ?, ?, ?, ?)')
  const link = databaseConnection.prepare('INSERT INTO saved_item_photos VALUES (?, ?, ?)')
  body.items.forEach((foodItem, itemIndex) => {
    item.run(foodItem.id, body.mealId, foodItem.entryId, itemIndex, foodItem.name, foodItem.description)
    entry.run(body.mealId, foodItem.entryId)
    foodItem.photos.forEach((value, photoIndex) => { photo.run(value.id, body.mealId, photoIndex, value.dataUrl, value.note); link.run(foodItem.id, value.id, photoIndex) })
  })
}

export function createPhotoMeal(request, response) {
  const error = validatePhotoMeal(request.body)
  if (error) return responseError(response, error.includes('large') ? 413 : 400, error)
  const state = readAppState()
  if (!state) return responseError(response, 409, 'Nourish database is not initialized.')
  if (hasEntryId(state.data.entries, request.body.entries)) return responseError(response, 409, 'A diary entry ID already exists.')
  try {
    const data = { ...state.data, entries: [...state.data.entries, ...request.body.entries] }
    inTransaction(databaseConnection, () => {
      writeState(data); insertMeal(request.body)
      if (request.body.analysisJobId && !linkAnalysisJobToMeal(databaseConnection, request.body.analysisJobId, request.body.mealId)) throw new Error('This analysis was already logged or is not ready.')
    })
    response.status(201).json({ data, revision: state.revision + 1 })
  } catch (caught) { responseError(response, 409, caught instanceof Error ? caught.message : 'Could not save meal photos.') }
}

export function readPhotoMeal(request, response) {
  const meal = getSavedMealForEntry(databaseConnection, request.params.entryId)
  return meal ? response.json(meal) : responseError(response, 404, 'No saved photos are associated with this entry.')
}

export function patchPhotoMeal(request, response) {
  const error = validateItemUpdate(request.body)
  if (error) return responseError(response, 400, error)
  if (!matchingPhotos(request.body.item)) return responseError(response, 404, 'Saved food item photos were not found.')
  try { updateSavedItemNotes(databaseConnection, request.params.mealId, request.body.item); response.json({ ok: true }) }
  catch (caught) { responseError(response, 404, caught instanceof Error ? caught.message : 'Saved food item was not found.') }
}

export function replacePhotoMeal(request, response) {
  const body = { ...request.body, mealId: request.params.mealId }
  const error = validatePhotoMeal(body)
  if (error || body.items.length !== 1) return responseError(response, 400, error || 'Replace one food item at a time.')
  const state = readAppState(); const oldItemId = request.params.itemId
  const stored = databaseConnection.prepare('SELECT entry_id entryId FROM saved_meal_items WHERE id = ? AND meal_id = ?').get(oldItemId, request.params.mealId)
  const oldEntry = state?.data.entries.find(entry => entry.id === stored?.entryId)
  if (!state || !stored || oldEntry?.source !== 'nourish-photo' || !matchingPhotos({ id: oldItemId, photos: body.items[0].photos })) return responseError(response, 404, 'Saved food item was not found.')
  if (hasEntryId(state.data.entries, body.entries, new Set([stored.entryId]))) return responseError(response, 409, 'The replacement entry ID already exists.')
  const data = { ...state.data, entries: [...state.data.entries.filter(entry => entry.id !== stored.entryId), ...body.entries] }
  try {
    inTransaction(databaseConnection, () => {
      writeState(data)
      databaseConnection.prepare('DELETE FROM saved_meal_entries WHERE entry_id = ?').run(stored.entryId)
      databaseConnection.prepare('UPDATE saved_meal_items SET entry_id = ?, name = ?, description = ? WHERE id = ? AND meal_id = ?').run(body.entries[0].id, body.items[0].name, body.items[0].description, oldItemId, request.params.mealId)
      databaseConnection.prepare('INSERT INTO saved_meal_entries VALUES (?, ?)').run(request.params.mealId, body.entries[0].id)
      if (request.body.analysisJobId && !linkAnalysisJobToMeal(databaseConnection, request.body.analysisJobId, request.params.mealId)) throw new Error('This analysis was already logged or is not ready.')
    })
    response.json({ data, revision: state.revision + 1 })
  } catch { responseError(response, 409, 'Could not replace the linked photo entry.') }
}

export function applyLoggedAnalysisUpdate(request, response) {
  const job = getAnalysisJob(databaseConnection, request.params.jobId)
  if (!job?.loggedMealId) return responseError(response, 409, 'This analysis is not linked to a Diary meal.')
  const body = { ...request.body, mealId: job.loggedMealId }
  const error = validatePhotoMeal(body)
  if (error) return responseError(response, error.includes('large') ? 413 : 400, error)
  try { response.json(updateLoggedAnalysisMeal(databaseConnection, job.id, body)) }
  catch (caught) { responseError(response, 409, caught instanceof Error ? caught.message : 'Could not update the logged Diary meal.') }
}

export function photoStorageUsage(_request, response) { response.json(getPhotoStorageUsage(databaseConnection)) }
export function deleteAllPhotos(_request, response) { clearSavedPhotos(databaseConnection); response.json(getPhotoStorageUsage(databaseConnection)) }
