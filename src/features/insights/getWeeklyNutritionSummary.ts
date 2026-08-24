type NutritionDay = {
  dateKey: string
  totalNutrients: { calories: number; protein: number }
}

export function getWeeklyNutritionSummary(days: NutritionDay[], maintenanceCalories: number, maintenanceThreshold: number, endingDateKey: string, currentDayKey?: string, currentDayCalories?: number) {
  const includedDays = days.filter(day => day.dateKey <= endingDateKey)
  const totals = includedDays.reduce((sum, day) => ({
    calories: sum.calories + getAdjustedCalories(day, maintenanceCalories, maintenanceThreshold, currentDayKey, currentDayCalories),
    protein: sum.protein + day.totalNutrients.protein,
  }), { calories: 0, protein: 0 })
  const divisor = includedDays.length || 1

  return {
    averageCalories: Math.round(totals.calories / divisor),
    averageProtein: Math.round(totals.protein / divisor),
  }
}

function getAdjustedCalories(day: NutritionDay, maintenanceCalories: number, maintenanceThreshold: number, currentDayKey?: string, currentDayCalories?: number) {
  if (day.dateKey === currentDayKey && currentDayCalories !== undefined && day.totalNutrients.calories <= maintenanceThreshold) return currentDayCalories
  return day.totalNutrients.calories <= maintenanceThreshold ? maintenanceCalories : day.totalNutrients.calories
}
