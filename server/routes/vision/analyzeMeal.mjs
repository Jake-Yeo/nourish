import { databaseConnection } from '../../database/databaseConnection.mjs'
import { createAnalysisJob, getAnalysisJob, listAnalysisJobs, retryAnalysisJob } from '../../database/analysisJobStore.mjs'
import { scheduleAnalysisJob } from '../../vision/processAnalysisJob.mjs'

const imagePattern = /^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=]+$/
const mealTypes = new Set(['Breakfast', 'Lunch', 'Dinner', 'Snacks'])
const idempotencyPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
function hasDuplicates(values) { return new Set(values).size !== values.length }
function validateItems(items) {
  if (!items.length || items.length > 12) return 'Add between 1 and 12 food items.'
  const photos = items.flatMap(item => Array.isArray(item?.photos) ? item.photos : [])
  if (items.some(item => typeof item?.id !== 'string' || !item.id || !item.photos?.length)) return 'Every food item needs at least one photo.'
  if (hasDuplicates(items.map(item => item.id))) return 'Food item IDs must be unique.'
  if (photos.length > 12) return 'You can add up to 12 meal photos.'
  if (photos.some(photo => typeof photo?.id !== 'string' || !photo.id) || hasDuplicates(photos.map(photo => photo.id))) return 'Meal photo IDs must be unique.'
  if (photos.some(photo => !imagePattern.test(String(photo?.dataUrl || '')))) return 'One or more meal photos are invalid.'
  if (photos.some(photo => String(photo.dataUrl).length > 5_500_000) || photos.reduce((sum, photo) => sum + String(photo.dataUrl).length, 0) > 28_000_000) return 'Those photos are too large.'
  return null
}
function validReplacement(value) {
  if (value === undefined) return true
  return value && typeof value === 'object' && ['mealId', 'itemId', 'entryId'].every(key => typeof value[key] === 'string' && value[key].length > 0 && value[key].length <= 200)
}
function normalizeSource(body) {
  return {
    items: body.items.map(item => ({ id: item.id, name: String(item.name || '').slice(0, 200), description: String(item.description || '').slice(0, 1000), photos: item.photos.map(photo => ({ id: photo.id, dataUrl: photo.dataUrl, note: String(photo.note || '').slice(0, 500) })) })),
    note: String(body.note || '').slice(0, 2000), mealType: body.mealType, date: body.date,
    ...(body.replacement ? { replacement: { mealId: body.replacement.mealId, itemId: body.replacement.itemId, entryId: body.replacement.entryId } } : {}),
  }
}
function validateRequest(body) {
  const items = Array.isArray(body?.items) ? body.items : []
  const itemError = validateItems(items)
  if (itemError) return itemError
  if (!mealTypes.has(body?.mealType)) return 'Choose a meal type.'
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(body?.date || ''))) return 'Choose a valid diary date.'
  if (!idempotencyPattern.test(String(body?.idempotencyKey || ''))) return 'A valid analysis attempt key is required.'
  if (!validReplacement(body?.replacement)) return 'Saved meal replacement context is invalid.'
  return null
}
export function analyzeMeal(request, response) {
  const error = validateRequest(request.body)
  if (error) return response.status(error.includes('large') ? 413 : 400).json({ error })
  try {
    const { job, created } = createAnalysisJob(databaseConnection, normalizeSource(request.body), request.body.idempotencyKey)
    if (created) scheduleAnalysisJob(job.id)
    return response.status(created ? 202 : 200).json(job)
  } catch (caught) { return response.status(Number(caught?.statusCode) || 500).json({ error: caught instanceof Error ? caught.message : 'Could not queue analysis.' }) }
}
export function analysisJobs(_request, response) { response.set('Cache-Control', 'no-store').json(listAnalysisJobs(databaseConnection)) }
export function analysisJob(request, response) {
  const job = getAnalysisJob(databaseConnection, request.params.jobId)
  return job ? response.set('Cache-Control', 'no-store').json(job) : response.status(404).json({ error: 'Meal analysis was not found.' })
}
export function retryMealAnalysis(request, response) {
  const job = retryAnalysisJob(databaseConnection, request.params.jobId)
  if (!job) return response.status(409).json({ error: 'Only failed or interrupted analyses can be retried.' })
  scheduleAnalysisJob(job.id)
  return response.status(202).json(job)
}
