import type { AppData } from '../../types'
import { normalizeNutritionData } from './normalizeNutritionData'

export function readCachedNutritionData(storageKey: string): AppData | null {
  try {
    return normalizeNutritionData(JSON.parse(localStorage.getItem(storageKey) || 'null'))
  } catch {
    return null
  }
}
