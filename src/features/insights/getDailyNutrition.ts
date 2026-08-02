import type { AppData } from '../../types'
import { getTotalNutrients } from '../../lib/nutrition/getTotalNutrients'
import { shiftDateKey } from '../../lib/dates/shiftDateKey'

export function getDailyNutrition(nutritionData: AppData, endingDateKey: string, dayCount: number) {
  return Array.from({ length: dayCount }, (_, dayIndex) => shiftDateKey(endingDateKey, dayIndex - dayCount + 1)).map(dateKey => ({
    dateKey,
    totalNutrients: getTotalNutrients(nutritionData.entries.filter(entry => entry.date === dateKey)),
  }))
}
