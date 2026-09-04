import { defaultGoals, getMaintenanceAdjustmentThreshold } from '../../data'
import { shiftDateKey } from '../../lib/dates/shiftDateKey'
import { getTotalNutrients } from '../../lib/nutrition/getTotalNutrients'
import type { DiaryEntry, Goals } from '../../types'
import { getCalorieDays } from './getCalorieDays'
import { getWeightChange } from './getWeightChange'

function getEffectiveDayCalories(entries: DiaryEntry[], goals: Goals) {
  const calorieGoal = goals.calories ?? defaultGoals.calories
  const actualCalories = getTotalNutrients(entries).calories
  return { calories: actualCalories > calorieGoal ? actualCalories : calorieGoal, usesCalorieGoal: actualCalories <= calorieGoal }
}

function getDateKeys(startDate: string, endDate: string) {
  const dates: string[] = []
  for (let dateKey = startDate; dateKey <= endDate; dateKey = shiftDateKey(dateKey, 1)) dates.push(dateKey)
  return dates
}

export function getTotalWeightEstimate(startDate: string, endDate: string, todayDateKey: string, entries: DiaryEntry[], goals: Goals) {
  if (startDate > endDate) return null
  const projectedStartDate = startDate > todayDateKey ? startDate : todayDateKey
  const projectedDateKeys = endDate >= projectedStartDate ? getDateKeys(projectedStartDate, endDate) : []
  const projectedDateSet = new Set(projectedDateKeys)
  const projectionDays = projectedDateKeys.map(date => ({ ...getEffectiveDayCalories(entries.filter(entry => entry.date === date), goals), date }))
  const calorieDays = getCalorieDays(entries).filter(day => !projectedDateSet.has(day.date))
  const change = getWeightChange([...calorieDays, ...projectionDays], goals.maintenanceCalories ?? defaultGoals.maintenanceCalories, getMaintenanceAdjustmentThreshold(goals), startDate, endDate, projectedDateKeys)
  const currentDay = projectionDays.find(day => day.date === todayDateKey)
  return { ...change, projectedDays: projectedDateKeys.length, usesCalorieGoal: currentDay?.usesCalorieGoal ?? false }
}
