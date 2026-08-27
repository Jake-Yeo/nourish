import { getAnalysisJob, markAnalysisDiaryUpdated } from './analysisJobStore.mjs'
import { inTransaction } from './savedMealStore.mjs'
import { isDeepStrictEqual } from 'node:util'

function sourceMatches(job, items) {
  if (job.source.items.length !== items.length) return false
  return job.source.items.every((sourceItem, index) => {
    const item = items[index]
    return item.id === sourceItem.id && item.name === sourceItem.name && item.description === sourceItem.description
      && item.photos.length === sourceItem.photos.length
      && item.photos.every((photo, photoIndex) => {
        const sourcePhoto = sourceItem.photos[photoIndex]
        return photo.id === sourcePhoto.id && photo.dataUrl === sourcePhoto.dataUrl && photo.note === sourcePhoto.note
      })
  })
}

function savedSourceMatches(database, mealId, storedItems, sourceItems, mealNote) {
  const savedMeal = database.prepare('SELECT meal_note mealNote FROM saved_meals WHERE id = ?').get(mealId)
  if (!savedMeal || savedMeal.mealNote !== mealNote) return false
  return storedItems.every((storedItem, index) => {
    const sourceItem = sourceItems[index]
    const details = database.prepare('SELECT name,description FROM saved_meal_items WHERE id = ? AND meal_id = ?').get(storedItem.id, mealId)
    const photos = database.prepare('SELECT photo.id,photo.data_url dataUrl,photo.note FROM saved_item_photos link JOIN saved_meal_photos photo ON photo.id = link.photo_id WHERE link.item_id = ? ORDER BY link.position').all(storedItem.id)
    return details?.name === sourceItem.name && details.description === sourceItem.description && photos.length === sourceItem.photos.length
      && photos.every((photo, photoIndex) => photo.id === sourceItem.photos[photoIndex].id && photo.dataUrl === sourceItem.photos[photoIndex].dataUrl && photo.note === sourceItem.photos[photoIndex].note)
  })
}

export function updateLoggedAnalysisMeal(database, analysisJobId, body) {
  return inTransaction(database, () => {
    const job = getAnalysisJob(database, analysisJobId)
    if (!job || job.status !== 'completed' || !job.loggedAt || !job.loggedMealId) throw new Error('This analysis is not linked to a completed Diary meal.')
    if (body.mealNote !== job.source.note || !sourceMatches(job, body.items) || body.items.some((item, index) => item.entryId !== body.entries[index]?.id)) throw new Error('The updated meal source does not match this analysis.')

    const stateRow = database.prepare('SELECT data, revision FROM app_state WHERE id = 1').get()
    if (!stateRow) throw new Error('Nourish database is not initialized.')
    const data = JSON.parse(stateRow.data)
    const allStoredItems = database.prepare('SELECT id,entry_id entryId FROM saved_meal_items WHERE meal_id = ? ORDER BY position').all(job.loggedMealId)
    const storedItems = job.source.replacement ? allStoredItems.filter(item => item.id === job.source.replacement.itemId) : allStoredItems
    const linkedEntries = database.prepare('SELECT entry_id entryId FROM saved_meal_entries WHERE meal_id = ? ORDER BY entry_id').all(job.loggedMealId)
    const expectedStoredItemIds = job.source.replacement && body.items.length === 1 ? [job.source.replacement.itemId] : body.items.map(item => item.id)
    if (storedItems.length !== body.items.length || storedItems.some((item, index) => item.id !== expectedStoredItemIds[index])) throw new Error('The linked photo meal no longer matches this analysis.')
    const linkedEntryIds = new Set(linkedEntries.map(link => link.entryId))
    if (storedItems.some(item => !linkedEntryIds.has(item.entryId)) || (!job.source.replacement && linkedEntries.length !== storedItems.length)) throw new Error('The linked photo meal entries are inconsistent.')

    const oldEntries = storedItems.map(item => data.entries.find(entry => entry.id === item.entryId))
    if (oldEntries.some(entry => !entry || entry.source !== 'nourish-photo')) throw new Error('The linked Diary item was removed or is no longer owned by Nourish photo analysis.')
    const replacementEntries = storedItems.map((item, index) => ({
      ...body.entries[index],
      id: oldEntries[index].id,
      food: { ...body.entries[index].food, id: oldEntries[index].food.id },
      date: oldEntries[index].date,
      meal: oldEntries[index].meal,
      loggedAt: oldEntries[index].loggedAt,
      source: 'nourish-photo',
    }))
    if (!job.diaryUpdatePending) {
      if (!isDeepStrictEqual(replacementEntries, oldEntries) || !savedSourceMatches(database, job.loggedMealId, storedItems, job.source.items, job.source.note)) throw new Error('This analysis update was already applied with different linked values.')
      return { data, revision: Number(stateRow.revision), job }
    }
    const replacements = new Map(storedItems.map((item, index) => [item.entryId, replacementEntries[index]]))
    const nextData = { ...data, entries: data.entries.map(entry => replacements.get(entry.id) || entry) }

    database.prepare('UPDATE app_state SET data = ?, revision = revision + 1, updated_at = ? WHERE id = 1').run(JSON.stringify(nextData), Date.now())
    database.prepare('UPDATE saved_meals SET meal_note = ?, updated_at = ? WHERE id = ?').run(body.mealNote || '', Date.now(), job.loggedMealId)
    const itemPlaceholders = storedItems.map(() => '?').join(',')
    const storedItemIds = storedItems.map(item => item.id)
    const oldPhotoIds = database.prepare(`SELECT photo_id photoId FROM saved_item_photos WHERE item_id IN (${itemPlaceholders})`).all(...storedItemIds).map(row => row.photoId)
    database.prepare(`DELETE FROM saved_item_photos WHERE item_id IN (${itemPlaceholders})`).run(...storedItemIds)
    const deleteOrphanPhoto = database.prepare('DELETE FROM saved_meal_photos WHERE id = ? AND meal_id = ? AND NOT EXISTS (SELECT 1 FROM saved_item_photos WHERE photo_id = ?)')
    oldPhotoIds.forEach(photoId => deleteOrphanPhoto.run(photoId, job.loggedMealId, photoId))
    const updateItem = database.prepare('UPDATE saved_meal_items SET name = ?, description = ? WHERE id = ? AND meal_id = ?')
    const insertPhoto = database.prepare('INSERT INTO saved_meal_photos VALUES (?, ?, ?, ?, ?)')
    const linkPhoto = database.prepare('INSERT INTO saved_item_photos VALUES (?, ?, ?)')
    body.items.forEach((item, itemIndex) => {
      const storedItemId = storedItems[itemIndex].id
      updateItem.run(item.name, item.description, storedItemId, job.loggedMealId)
      item.photos.forEach((photo, photoIndex) => {
        const existingPhoto = database.prepare('SELECT meal_id mealId,data_url dataUrl,note FROM saved_meal_photos WHERE id = ?').get(photo.id)
        if (existingPhoto && (existingPhoto.mealId !== job.loggedMealId || existingPhoto.dataUrl !== photo.dataUrl || existingPhoto.note !== photo.note)) throw new Error('A source photo no longer matches the linked meal.')
        if (!existingPhoto) insertPhoto.run(photo.id, job.loggedMealId, itemIndex * 100 + photoIndex, photo.dataUrl, photo.note)
        linkPhoto.run(storedItemId, photo.id, photoIndex)
      })
    })
    if (!markAnalysisDiaryUpdated(database, job.id, job.loggedMealId)) throw new Error('This analysis update was already applied or is no longer current.')
    return { data: nextData, revision: Number(stateRow.revision) + 1, job: getAnalysisJob(database, job.id) }
  })
}
