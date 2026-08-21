export type CalorieDay = { date: string; calories: number }

const caloriesPerPound = 3500
export function getWeightChange(days: CalorieDay[], maintenanceCalories: number, maintenanceThreshold: number, startDate: string, endDate: string, unadjustedDates: string[] = []) {
  const unadjustedDateSet = new Set(unadjustedDates)
  const loggedDays = days.filter(day => day.date >= startDate && day.date <= endDate)
  const calorieBalance = loggedDays.reduce((total, day) => total + (unadjustedDateSet.has(day.date) || day.calories > maintenanceThreshold ? day.calories : maintenanceCalories) - maintenanceCalories, 0)

  return { calorieBalance, loggedDays: loggedDays.length, pounds: calorieBalance / caloriesPerPound }
}
