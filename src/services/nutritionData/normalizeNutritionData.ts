import { defaultGoals } from '../../data'
import type { AppData } from '../../types'
import { initialNutritionData } from './initialNutritionData'

export function normalizeNutritionData(value: Partial<AppData> | null): AppData {
  return { ...initialNutritionData, ...value, entries: Array.isArray(value?.entries) ? value.entries : [], goals: { ...defaultGoals, ...value?.goals } }
}
