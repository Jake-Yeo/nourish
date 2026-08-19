import { defaultGoals, getMaintenanceAdjustmentThreshold } from '../../data'
import { getTotalNutrients } from '../../lib/nutrition/getTotalNutrients'
import { getCalorieDays } from '../insights/getCalorieDays'
import { getWeightChange } from '../insights/getWeightChange'
import type { DiaryEntry, Goals } from '../../types'

export type DailyWeightEstimate =
  | { status: 'unavailable' | 'empty'; pounds: null }
  | { status: 'estimate'; pounds: number; usesCalorieGoal: boolean }

export function getTotalWeightEstimate(startDate: string, endDate: string, entries: DiaryEntry[], goals: Goals) {
  if (startDate > endDate) return null
  return getWeightChange(getCalorieDays(entries), goals.maintenanceCalories ?? defaultGoals.maintenanceCalories, getMaintenanceAdjustmentThreshold(goals), startDate, endDate)
}

export function getDailyWeightEstimate(dateKey: string, todayDateKey: string, entries: DiaryEntry[], goals: Goals): DailyWeightEstimate {
  if (dateKey > todayDateKey) return { status: 'unavailable', pounds: null }
  const maintenanceCalories = goals.maintenanceCalories ?? defaultGoals.maintenanceCalories
  if (dateKey === todayDateKey) {
    const calorieGoal = goals.calories ?? defaultGoals.calories
    const actualCalories = getTotalNutrients(entries).calories
    const effectiveCalories = actualCalories > calorieGoal ? actualCalories : calorieGoal
    return { status: 'estimate', pounds: (effectiveCalories - maintenanceCalories) / 3500, usesCalorieGoal: actualCalories <= calorieGoal }
  }
  if (entries.length === 0) return { status: 'empty', pounds: null }
  const actualCalories = getTotalNutrients(entries).calories
  const effectiveCalories = actualCalories <= getMaintenanceAdjustmentThreshold(goals) ? maintenanceCalories : actualCalories
  return { status: 'estimate', pounds: (effectiveCalories - maintenanceCalories) / 3500, usesCalorieGoal: false }
}