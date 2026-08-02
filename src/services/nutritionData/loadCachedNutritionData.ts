import { initialNutritionData } from './initialNutritionData'
import { readCachedNutritionData } from './readCachedNutritionData'
import { nutritionDataStorageKeys } from './storageKeys'

export function loadCachedNutritionData() {
  return readCachedNutritionData(nutritionDataStorageKeys.cache) || readCachedNutritionData(nutritionDataStorageKeys.legacy) || initialNutritionData
}
