import { useEffect, useMemo, useState } from 'react'
import type { AppData } from '../../types'
import { getMaintenanceAdjustmentThreshold } from '../../data'
import { Card } from '../../components/ui/Card'
import { getTodayDateKey } from '../../lib/dates/getTodayDateKey'
import { getTotalWeightEstimate } from './getTotalWeightEstimate'
import { formatDateRange, getDefaultWeightChangeRange } from './weightChangeDates'

type WeightChangeSummaryProps = { nutritionData: AppData; onStartDateChange: (startDate: string) => Promise<boolean> }

function getChangeLabel(pounds: number) {
  if (pounds > 0) return 'Estimated gain'
  if (pounds < 0) return 'Estimated loss'
  return 'No estimated change'
}

export function WeightChangeSummary({ nutritionData, onStartDateChange }: WeightChangeSummaryProps) {
  const persistedStartDate = nutritionData.weightChangeStartDate ?? getDefaultWeightChangeRange().startDate
  const [startDate, setStartDate] = useState(persistedStartDate)
  const endDate = getTodayDateKey()
  const change = useMemo(() => startDate <= endDate ? getTotalWeightEstimate(startDate, endDate, endDate, nutritionData.entries, nutritionData.goals) : null, [endDate, nutritionData.entries, nutritionData.goals, startDate])
  const maintenanceThreshold = getMaintenanceAdjustmentThreshold(nutritionData.goals)
  const validRange = startDate <= endDate
  const pounds = Math.abs(change?.pounds ?? 0).toFixed(2)
  const loggedDays = change ? change.loggedDays - change.projectedDays : 0
  const currentDayNote = !change || change.projectedDays === 0 ? null
    : change.usesCalorieGoal ? 'Includes today’s calorie goal because the day is incomplete.'
      : 'Includes today’s logged calories because they exceed your calorie goal.'

  useEffect(() => setStartDate(persistedStartDate), [persistedStartDate])
  const saveStartDate = async (nextStartDate: string) => {
    setStartDate(nextStartDate)
    if (!await onStartDateChange(nextStartDate)) setStartDate(persistedStartDate)
  }

  return <Card padding="large">
    <p className="text-eyebrow font-extrabold uppercase tracking-widest text-primary">Weight change estimate</p>
    <div className="mt-control-wide flex items-end justify-between gap-content"><div><h2 className="text-section font-extrabold tracking-tight text-ink">{change ? getChangeLabel(change.pounds) : 'Choose a valid start date'}</h2><p className="mt-badge text-3xl font-extrabold tracking-tight text-primary">{change ? `${pounds} lb` : '—'}</p></div><p className="max-w-40 text-right text-detail text-muted">{loggedDays} logged day{loggedDays === 1 ? '' : 's'}</p></div>
    <div className="mt-content grid gap-control-wide compact:grid-cols-2"><label className="grid gap-badge text-detail font-bold text-ink">Start date<input aria-label="Weight estimate start date" className="min-h-12 rounded-field border border-border bg-surface px-control-wide text-base font-semibold text-ink outline-none focus-visible:ring-3 focus-visible:ring-primary/20" max={endDate} onChange={event => void saveStartDate(event.target.value)} type="date" value={startDate} /></label><div className="grid gap-badge text-detail font-bold text-ink"><span>Through today</span><p className="min-h-12 rounded-field border border-border bg-canvas px-control-wide py-control-wide text-base font-semibold text-ink">{new Date(`${endDate}T12:00:00`).toLocaleDateString()}</p></div></div>
    {change && <p className="mt-content text-detail text-muted">{formatDateRange(startDate, endDate)} · {Math.abs(Math.round(change.calorieBalance)).toLocaleString()} calorie {change.calorieBalance >= 0 ? 'surplus' : 'deficit'} against maintenance.</p>}
    {currentDayNote && <p className="mt-control text-detail text-muted">{currentDayNote}</p>}
    {!validRange && <p className="mt-content text-detail font-bold text-destructive">Start date must be today or earlier.</p>}
    {loggedDays === 0 && !currentDayNote && <p className="mt-content text-detail text-muted">Log meals in this range to see an estimate.</p>}
    <p className="mt-content text-caption text-muted">Your start date is saved to Nourish and syncs across your devices; the end date always updates to today. Days logged at {maintenanceThreshold.toLocaleString()} calories or less use your maintenance calories for the estimate.</p>
  </Card>
}
