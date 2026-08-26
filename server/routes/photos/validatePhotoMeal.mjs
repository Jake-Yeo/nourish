const imagePattern = /^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=]+$/
const mealTypes = new Set(['Breakfast', 'Lunch', 'Dinner', 'Snacks'])
const nutrients = ['calories', 'protein', 'carbs', 'fat', 'fiber', 'sugar', 'sodium', 'saturatedFat', 'cholesterol', 'potassium', 'calcium', 'iron']

function uniqueIds(items) { const ids = items.map(item => item.id); return ids.every(id => typeof id === 'string' && id) && new Set(ids).size === ids.length }
function validNutrients(value) { return value && nutrients.every(name => Number.isFinite(value[name]) && value[name] >= 0) }
function validCalorieBreakdown(value) {
  if (value === undefined) return true
  return typeof value?.explanation === 'string' && value.explanation.length <= 2_000 && Array.isArray(value.components)
    && value.components.length > 0 && value.components.length <= 192 && value.components.every(component => typeof component?.name === 'string'
      && component.name.length <= 200 && typeof component.portion === 'string' && component.portion.length <= 200
      && Number.isFinite(component.calories) && component.calories >= 0 && typeof component.evidence === 'string' && component.evidence.length <= 500)
}
function validEntry(entry) {
  const explanation = entry?.aiPhotoExplanation
  const validExplanation = explanation && ['low', 'medium', 'high'].includes(explanation.confidence) && typeof explanation.summary === 'string'
    && Array.isArray(explanation.assumptions) && validCalorieBreakdown(explanation.calorieBreakdown)
  return typeof entry?.id === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(entry.date) && mealTypes.has(entry.meal) && entry.source === 'nourish-photo' && entry.servings > 0 && entry.loggedAt > 0 && typeof entry.food?.name === 'string' && entry.food.name && typeof entry.food.servingLabel === 'string' && validNutrients(entry.food.nutrients) && validExplanation
}
function validItem(item, entryIds) {
  return typeof item?.id === 'string' && item.id && entryIds.has(item.entryId) && typeof item.name === 'string' && item.name.length <= 500 && typeof item.description === 'string' && item.description.length <= 4000 && Array.isArray(item.photos) && item.photos.length > 0 && item.photos.every(photo => imagePattern.test(photo.dataUrl) && typeof photo.note === 'string' && photo.note.length <= 2000)
}

export function validatePhotoMeal(body) {
  if (!body || typeof body.mealId !== 'string' || !body.mealId || !Array.isArray(body.entries) || !body.entries.length || !Array.isArray(body.items) || body.items.length !== body.entries.length) return 'Meal items and diary entries are required.'
  if (!uniqueIds(body.entries) || !uniqueIds(body.items) || body.entries.some(entry => !validEntry(entry))) return 'One or more diary entries are invalid.'
  const entryIds = new Set(body.entries.map(entry => entry.id))
  if (body.items.some(item => !validItem(item, entryIds))) return 'One or more food items are invalid.'
  const photos = body.items.flatMap(item => item.photos)
  if (photos.length > 12 || !uniqueIds(photos)) return 'Add between 1 and 12 unique photos.'
  if (photos.some(photo => photo.dataUrl.length > 5_500_000) || photos.reduce((sum, photo) => sum + photo.dataUrl.length, 0) > 28_000_000) return 'Those photos are too large.'
  if (typeof (body.mealNote || '') !== 'string' || String(body.mealNote || '').length > 4000) return 'Meal note is too long.'
  return null
}

export function validateItemUpdate(body) {
  if (!body?.item || typeof body.item.id !== 'string' || typeof body.item.name !== 'string' || !body.item.name || typeof body.item.description !== 'string' || !Array.isArray(body.item.photos) || !body.item.photos.length || !uniqueIds(body.item.photos)) return 'Food item notes are invalid.'
  if (body.item.photos.some(photo => typeof photo.note !== 'string' || photo.note.length > 2000)) return 'Photo notes are invalid.'
  return null
}
