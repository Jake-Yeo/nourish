import type { AppData } from '../../types'
import { cacheNutritionData } from './cacheNutritionData'
import { normalizeNutritionData } from './normalizeNutritionData'

export async function requestNutritionData(url: string, requestOptions?: RequestInit): Promise<AppData> {
  const response = await fetch(url, requestOptions)
  const responsePayload = await response.json()
  if (!response.ok) throw new Error(responsePayload.error || 'Could not save Nourish data.')
  const nutritionData = normalizeNutritionData(responsePayload.data)
  cacheNutritionData(nutritionData)
  return nutritionData
}
