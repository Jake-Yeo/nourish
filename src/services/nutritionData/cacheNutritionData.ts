import type { AppData } from '../../types'
import { nutritionDataStorageKeys } from './storageKeys'

export function cacheNutritionData(nutritionData: AppData) {
  localStorage.setItem(nutritionDataStorageKeys.cache, JSON.stringify(nutritionData))
}
