import { Card } from '../../components/ui/Card'
import type { AppData } from '../../types'
import { getMaintenanceAdjustmentThreshold } from '../../data'
import { getDailyNutrition } from './getDailyNutrition'
import { getWeeklyNutritionSummary } from './getWeeklyNutritionSummary'
import { MaintenanceEstimateNote } from './MaintenanceEstimateNote'
import { WeeklyHistorySummary } from './WeeklyHistorySummary'
import { formatDateRange } from './weightChangeDates'

type WeeklyHistoryCardProps = {
  caloriesByDate: Map<string, number>
  change: { loggedDays: number; pounds: number }
  chosenStartDate: string
  cumulativeChange: { loggedDays: number; pounds: number } | null
  endingDateKey: string
  endDate: string
  nutritionData: AppData
  startDate: string
}

function getChangeLabel(loggedDays: number, pounds: number) {
  if (!loggedDays) return '—'
  const direction = pounds > 0 ? 'gain' : pounds < 0 ? 'loss' : 'no change'
  return pounds === 0 ? direction : `${Math.abs(pounds).toFixed(2)} lb ${direction}`
}

export function WeeklyHistoryCard(props: WeeklyHistoryCardProps) {
  const { caloriesByDate, change, chosenStartDate, cumulativeChange, endingDateKey, endDate, nutritionData, startDate } = props
  const isNewestWeek = endingDateKey >= startDate && endingDateKey <= endDate
  const summaryEndDate = isNewestWeek ? endingDateKey : endDate
  const maintenanceThreshold = getMaintenanceAdjustmentThreshold(nutritionData.goals)
  const weekDays = getDailyNutrition(nutritionData, endDate, 7)
  const displayedDays = weekDays.filter(day => day.dateKey <= summaryEndDate)
  const summary = getWeeklyNutritionSummary(weekDays, nutritionData.goals.maintenanceCalories, maintenanceThreshold, summaryEndDate, isNewestWeek ? endingDateKey : undefined, nutritionData.goals.calories)

  return <Card className="px-content py-control-wide" padding="none" variant="flat">
    <p className="text-detail font-extrabold text-ink">{formatDateRange(startDate, endDate)}</p>
    <p className="mt-badge text-caption text-muted">{change.loggedDays ? `${change.loggedDays} logged day${change.loggedDays === 1 ? '' : 's'}` : 'No logged days'}</p>
    <WeeklyHistorySummary
      averageCalories={summary.averageCalories}
      averageProtein={summary.averageProtein}
      changeLabel={getChangeLabel(change.loggedDays, change.pounds)}
      cumulativeChangeLabel={cumulativeChange ? getChangeLabel(cumulativeChange.loggedDays, cumulativeChange.pounds) : '—'}
      cumulativeRangeLabel={cumulativeChange ? formatDateRange(chosenStartDate, summaryEndDate) : 'Chosen start date is after this week'}
    />
    <div className="mt-control border-t border-border pt-control">{displayedDays.map(day => {
      const actualCalories = caloriesByDate.get(day.dateKey)
      const usesCurrentDayGoal = isNewestWeek && day.dateKey === endingDateKey && day.totalNutrients.calories <= maintenanceThreshold
      const usedMaintenance = usesCurrentDayGoal || actualCalories !== undefined && actualCalories <= maintenanceThreshold
      return <div className="flex items-start justify-between gap-control py-badge text-caption text-muted" key={day.dateKey}>
        <span>{new Date(`${day.dateKey}T12:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short', weekday: 'short' })}</span>
        <div className="text-right"><p className="font-bold text-ink">{Math.round(day.totalNutrients.calories).toLocaleString()} cal</p>{usedMaintenance && <MaintenanceEstimateNote actualCalories={actualCalories ?? day.totalNutrients.calories} assumedCalories={usesCurrentDayGoal ? nutritionData.goals.calories : nutritionData.goals.maintenanceCalories} usesCurrentDayGoal={usesCurrentDayGoal} />}</div>
      </div>
    })}</div>
  </Card>
}
