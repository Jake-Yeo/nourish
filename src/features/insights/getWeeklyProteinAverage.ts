import type { AppData } from '../../types'
import { getDailyNutrition } from './getDailyNutrition'

const daysPerWeek = 7

export function getWeeklyProteinAverage(nutritionData: AppData, selectedDateKey: string) {
  const selectedDate = new Date(`${selectedDateKey}T12:00:00`)
  const elapsedDayCount = (selectedDate.getDay() + 6) % daysPerWeek + 1
  const elapsedWeekProtein = getDailyNutrition(nutritionData, selectedDateKey, elapsedDayCount)
    .reduce((total, day) => total + day.totalNutrients.protein, 0)
  return elapsedWeekProtein / elapsedDayCount
}
