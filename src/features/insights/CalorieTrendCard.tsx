import { useState } from 'react'
import type { AppData } from '../../types'
import { Card } from '../../components/ui/Card'
import { Typography } from '../../components/ui/Typography'
import { getDailyNutrition } from './getDailyNutrition'
import { CalorieTrendChart } from './CalorieTrendChart'

export function CalorieTrendCard({ endingDateKey, nutritionData }: { endingDateKey: string; nutritionData: AppData }) {
  const [dayCount, setDayCount] = useState(7)
  const dailyNutrition = getDailyNutrition(nutritionData, endingDateKey, dayCount)
  const assumedMaintenanceDays = dailyNutrition.filter(day => day.totalNutrients.calories < 1000).length
  const adjustedCalories = dailyNutrition.map(day => day.totalNutrients.calories < 1000 ? nutritionData.goals.maintenanceCalories : day.totalNutrients.calories)
  const averageCalories = adjustedCalories.reduce((calorieSum, calories) => calorieSum + calories, 0) / dayCount

  return <Card variant="dark" padding="large" className="bg-linear-to-br from-primary-strong to-primary">
    <div className="flex items-start justify-between gap-control-wide"><div><Typography variant="eyebrow" className="text-chart">{dayCount}-day view</Typography><Typography as="h2" variant="pageTitle" className="mt-control text-surface">Your nutrition trend</Typography></div><label className="flex items-center gap-control text-caption font-bold text-chart-copy">Days<select className="min-h-10 w-16 rounded-control border border-surface/25 bg-primary px-control py-control text-center text-base font-extrabold text-surface outline-none" value={dayCount} onChange={event => setDayCount(Number(event.target.value))}>{Array.from({ length: 89 }, (_, index) => index + 2).map(days => <option key={days} value={days}>{days}</option>)}</select></label></div>
    <CalorieTrendChart dailyNutrition={dailyNutrition} goals={nutritionData.goals} />
    <Typography className="mt-section text-chart-copy"><strong className="text-section text-surface">{Math.round(averageCalories).toLocaleString()}</strong> average calories per day</Typography>
    {assumedMaintenanceDays > 0 && <Typography variant="caption" className="mt-control block text-chart">Used {nutritionData.goals.maintenanceCalories.toLocaleString()} calories for {assumedMaintenanceDays} day{assumedMaintenanceDays === 1 ? '' : 's'} logged below 1,000.</Typography>}
  </Card>
}
