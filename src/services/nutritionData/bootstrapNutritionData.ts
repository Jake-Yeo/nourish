import { readCachedNutritionData } from './readCachedNutritionData'
import { requestNutritionData } from './requestNutritionData'
import { nutritionDataStorageKeys } from './storageKeys'

export async function bootstrapNutritionData() {
  const requiresMigration = localStorage.getItem(nutritionDataStorageKeys.migration) !== 'done'
  const legacyNutritionData = requiresMigration ? readCachedNutritionData(nutritionDataStorageKeys.legacy) : null
  const nutritionData = await requestNutritionData('/api/data/bootstrap', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ localData: legacyNutritionData }) })
  localStorage.setItem(nutritionDataStorageKeys.migration, 'done')
  localStorage.removeItem(nutritionDataStorageKeys.legacy)
  return nutritionData
}
