import { useMemo, useState } from 'react'
import type { AppData } from '../../types'
import { getMaintenanceAdjustmentThreshold } from '../../data'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { getCalorieDays } from './getCalorieDays'
import { getWeightChange } from './getWeightChange'
import { WeeklyHistoryCard } from './WeeklyHistoryCard'
import { getWeekDateRanges } from './weightChangeDates'

const weeksPerPage = 8

export function WeeklyWeightChangeList({ endingDateKey, nutritionData }: { endingDateKey: string; nutritionData: AppData }) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [weekCount, setWeekCount] = useState(weeksPerPage)
  const calorieDays = useMemo(() => getCalorieDays(nutritionData.entries), [nutritionData.entries])
  const maintenanceThreshold = getMaintenanceAdjustmentThreshold(nutritionData.goals)
  const caloriesByDate = useMemo(() => new Map(calorieDays.map(day => [day.date, day.calories])), [calorieDays])
  const weeks = getWeekDateRanges(endingDateKey, weekCount)

  return <Card padding="large">
    <div className="flex items-start justify-between gap-content">
      <div><p className="text-eyebrow font-extrabold uppercase tracking-widest text-primary">Weekly history</p><h2 className="mt-badge text-section font-extrabold tracking-tight text-ink">Monday–Sunday estimates</h2></div>
      <Button aria-expanded={isExpanded} onClick={() => setIsExpanded(expanded => !expanded)} size="compact" variant="secondary">{isExpanded ? 'Collapse' : 'Expand'}</Button>
    </div>
    {isExpanded && <><div className="mt-content grid gap-control-wide">{weeks.map(week => <WeeklyHistoryCard
      caloriesByDate={caloriesByDate}
      change={getWeightChange(calorieDays, nutritionData.goals.maintenanceCalories, maintenanceThreshold, week.startDate, week.endDate)}
      endingDateKey={endingDateKey}
      endDate={week.endDate}
      key={week.startDate}
      nutritionData={nutritionData}
      startDate={week.startDate}
    />)}</div><Button className="mt-content" fullWidth onClick={() => setWeekCount(count => count + weeksPerPage)} variant="secondary">Load older weeks</Button></>}
  </Card>
}
