import { useState } from 'react'
import type { AppData } from '../../types'
import { getMaintenanceAdjustmentThreshold } from '../../data'
import { getTodayDateKey } from '../../lib/dates/getTodayDateKey'
import { Card } from '../../components/ui/Card'
import { Typography } from '../../components/ui/Typography'
import { getDailyNutrition } from './getDailyNutrition'
import { getMondayDateKey } from './weightChangeDates'
import { CalorieTrendChart } from './CalorieTrendChart'

function getCurrentWeekDayCount(endingDateKey: string) {
  return Math.round((new Date(`${endingDateKey}T12:00:00`).getTime() - new Date(`${getMondayDateKey(endingDateKey)}T12:00:00`).getTime()) / 86_400_000) + 1
}

export function CalorieTrendCard({ endingDateKey, nutritionData }: { endingDateKey: string; nutritionData: AppData }) {
  const [dayCount, setDayCount] = useState(7)
  const currentDayKey = endingDateKey === getTodayDateKey() ? endingDateKey : undefined
  const trendDayCount = dayCount === 7 && currentDayKey ? getCurrentWeekDayCount(endingDateKey) : dayCount
  const dailyNutrition = getDailyNutrition(nutritionData, endingDateKey, trendDayCount)
  const maintenanceCalorieThreshold = getMaintenanceAdjustmentThreshold(nutritionData.goals)
  const usesCurrentDayGoal = currentDayKey !== undefined && dailyNutrition.some(day => day.dateKey === currentDayKey && day.totalNutrients.calories <= maintenanceCalorieThreshold)
  const assumedMaintenanceDays = dailyNutrition.filter(day => day.dateKey !== currentDayKey && day.totalNutrients.calories <= maintenanceCalorieThreshold).length
  const adjustedCalories = dailyNutrition.map(day => {
    if (day.dateKey === currentDayKey && usesCurrentDayGoal) return nutritionData.goals.calories
    return day.totalNutrients.calories <= maintenanceCalorieThreshold ? nutritionData.goals.maintenanceCalories : day.totalNutrients.calories
  })
  const averageCalories = adjustedCalories.reduce((calorieSum, calories) => calorieSum + calories, 0) / trendDayCount

  return <Card variant="dark" padding="large" className="min-w-0 bg-linear-to-br from-primary-strong to-primary">
    <div className="flex items-start justify-between gap-control-wide"><div><Typography variant="eyebrow" className="text-chart">{trendDayCount === dayCount ? `${dayCount}-day view` : 'This week so far'}</Typography><Typography as="h2" variant="pageTitle" className="mt-control text-surface">Your nutrition trend</Typography></div><label className="flex items-center gap-control text-caption font-bold text-chart-copy">Days<select className="min-h-10 w-16 rounded-control border border-surface/25 bg-primary px-control py-control text-center text-base font-extrabold text-surface outline-none" value={dayCount} onChange={event => setDayCount(Number(event.target.value))}>{Array.from({ length: 89 }, (_, index) => index + 2).map(days => <option key={days} value={days}>{days}</option>)}</select></label></div>
    <CalorieTrendChart dailyNutrition={dailyNutrition} goals={nutritionData.goals} />
    <Typography className="mt-section text-chart-copy"><strong className="text-section text-surface">{Math.round(averageCalories).toLocaleString()}</strong> average calories per day</Typography>
    {usesCurrentDayGoal && <Typography variant="caption" className="mt-control block text-chart">Current day uses your {nutritionData.goals.calories.toLocaleString()} calorie goal.</Typography>}
    {assumedMaintenanceDays > 0 && <Typography variant="caption" className="mt-control block text-chart">Used {nutritionData.goals.maintenanceCalories.toLocaleString()} calories for {assumedMaintenanceDays} day{assumedMaintenanceDays === 1 ? '' : 's'} logged at or below {maintenanceCalorieThreshold.toLocaleString()}.</Typography>}
  </Card>
}
