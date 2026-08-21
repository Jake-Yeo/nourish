import { defaultGoals, getMaintenanceAdjustmentThreshold } from '../../data'
import { getTotalNutrients } from '../../lib/nutrition/getTotalNutrients'
import { getCalorieDays } from '../insights/getCalorieDays'
import { getWeightChange } from '../insights/getWeightChange'
import type { DiaryEntry, Goals } from '../../types'

export type DailyWeightEstimate =
  | { status: 'unavailable' | 'empty'; pounds: null }
  | { status: 'estimate'; pounds: number; usesCalorieGoal: boolean }

function getEffectiveCurrentDayCalories(entries: DiaryEntry[], goals: Goals) {
  const calorieGoal = goals.calories ?? defaultGoals.calories
  const actualCalories = getTotalNutrients(entries).calories
  return { calories: actualCalories > calorieGoal ? actualCalories : calorieGoal, usesCalorieGoal: actualCalories <= calorieGoal }
}

export function getTotalWeightEstimate(startDate: string, endDate: string, todayDateKey: string, entries: DiaryEntry[], goals: Goals) {
  if (startDate > endDate || endDate > todayDateKey) return null
  const includesCurrentDay = endDate === todayDateKey
  const currentDayEntries = entries.filter(entry => entry.date === todayDateKey)
  const calorieDays = getCalorieDays(entries).filter(day => day.date !== todayDateKey)
  const currentDay = getEffectiveCurrentDayCalories(currentDayEntries, goals)
  const days = includesCurrentDay ? [...calorieDays, { calories: currentDay.calories, date: todayDateKey }] : calorieDays
  const change = getWeightChange(days, goals.maintenanceCalories ?? defaultGoals.maintenanceCalories, getMaintenanceAdjustmentThreshold(goals), startDate, endDate, includesCurrentDay ? [todayDateKey] : [])
  return { ...change, includesCurrentDay, usesCalorieGoal: includesCurrentDay && currentDay.usesCalorieGoal }
}

export function getDailyWeightEstimate(dateKey: string, todayDateKey: string, entries: DiaryEntry[], goals: Goals): DailyWeightEstimate {
  if (dateKey > todayDateKey) return { status: 'unavailable', pounds: null }
  const maintenanceCalories = goals.maintenanceCalories ?? defaultGoals.maintenanceCalories
  if (dateKey === todayDateKey) {
    const currentDay = getEffectiveCurrentDayCalories(entries, goals)
    return { status: 'estimate', pounds: (currentDay.calories - maintenanceCalories) / 3500, usesCalorieGoal: currentDay.usesCalorieGoal }
  }
  if (entries.length === 0) return { status: 'empty', pounds: null }
  const actualCalories = getTotalNutrients(entries).calories
  const effectiveCalories = actualCalories <= getMaintenanceAdjustmentThreshold(goals) ? maintenanceCalories : actualCalories
  return { status: 'estimate', pounds: (effectiveCalories - maintenanceCalories) / 3500, usesCalorieGoal: false }
}
