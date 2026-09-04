import { defaultGoals, getMaintenanceAdjustmentThreshold } from '../../data'
import { getTotalNutrients } from '../../lib/nutrition/getTotalNutrients'
import type { DiaryEntry, Goals } from '../../types'

export type DailyWeightEstimate =
  | { status: 'empty'; pounds: null }
  | { status: 'estimate'; pounds: number; usesCalorieGoal: boolean; isProjection: boolean }

function getEffectiveDayCalories(entries: DiaryEntry[], goals: Goals) {
  const calorieGoal = goals.calories ?? defaultGoals.calories
  const actualCalories = getTotalNutrients(entries).calories
  return { calories: actualCalories > calorieGoal ? actualCalories : calorieGoal, usesCalorieGoal: actualCalories <= calorieGoal }
}

export function getDailyWeightEstimate(dateKey: string, todayDateKey: string, entries: DiaryEntry[], goals: Goals): DailyWeightEstimate {
  const maintenanceCalories = goals.maintenanceCalories ?? defaultGoals.maintenanceCalories
  if (dateKey >= todayDateKey) {
    const day = getEffectiveDayCalories(entries, goals)
    return { status: 'estimate', pounds: (day.calories - maintenanceCalories) / 3500, usesCalorieGoal: day.usesCalorieGoal, isProjection: dateKey > todayDateKey }
  }
  if (entries.length === 0) return { status: 'empty', pounds: null }
  const actualCalories = getTotalNutrients(entries).calories
  const effectiveCalories = actualCalories <= getMaintenanceAdjustmentThreshold(goals) ? maintenanceCalories : actualCalories
  return { status: 'estimate', pounds: (effectiveCalories - maintenanceCalories) / 3500, usesCalorieGoal: false, isProjection: false }
}
