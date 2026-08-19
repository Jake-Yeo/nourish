import { Scale } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Typography } from '../../components/ui/Typography'
import type { DiaryEntry, Goals } from '../../types'
import { getTodayDateKey } from '../../lib/dates/getTodayDateKey'
import { getTotalWeightEstimate, getDailyWeightEstimate } from './getDailyWeightEstimate'
import { getDefaultWeightChangeRange } from '../insights/weightChangeDates'

type DailyWeightEstimateCardProps = { dateKey: string; entries: DiaryEntry[]; allEntries: DiaryEntry[]; goals: Goals; weightChangeStartDate?: string }

export function DailyWeightEstimateCard({ dateKey, entries, allEntries, goals, weightChangeStartDate }: DailyWeightEstimateCardProps) {
  const todayDateKey = getTodayDateKey()
  const estimate = getDailyWeightEstimate(dateKey, todayDateKey, entries, goals)
  const startDate = weightChangeStartDate ?? getDefaultWeightChangeRange().startDate
  const total = dateKey <= todayDateKey ? getTotalWeightEstimate(startDate, dateKey, allEntries, goals) : null
  const description = estimate.status === 'unavailable' ? 'Unavailable for future dates. No projections.'
    : estimate.status === 'empty' ? 'No estimate · no meals logged.'
      : 'usesCalorieGoal' in estimate && estimate.usesCalorieGoal ? 'Uses your calorie goal because today is incomplete.'
        : 'Based only on this day’s calorie balance.'
  const label = estimate.status !== 'estimate' ? 'No estimate'
    : estimate.pounds > 0 ? 'Estimated gain'
      : estimate.pounds < 0 ? 'Estimated loss' : 'No estimated change'
  const value = estimate.status === 'estimate' && estimate.pounds !== 0 ? `${Math.abs(estimate.pounds).toFixed(2)} lb` : null
  const totalLabel = total ? total.pounds > 0 ? 'Total estimated gain' : total.pounds < 0 ? 'Total estimated loss' : 'No total estimated change' : null
  const totalValue = total ? `${Math.abs(total.pounds).toFixed(2)} lb` : null

  return <Card variant="soft" aria-label="Selected day estimated weight change">
    <div className="flex items-start gap-control-wide">
      <span className="grid size-icon-small shrink-0 place-items-center rounded-icon bg-surface text-primary"><Scale className="w-5" aria-hidden="true" /></span>
      <div className="min-w-0 flex-1">
        <Typography variant="eyebrow">Daily estimate</Typography>
        <div className="flex flex-wrap items-baseline justify-between gap-control">
          <Typography as="h2" variant="sectionTitle">{label}</Typography>
          {value && <strong className="text-section text-primary-strong">{value}</strong>}
        </div>
        <Typography variant="muted" className="mt-control">{description}</Typography>
        {total && <div className="mt-content flex flex-wrap items-baseline justify-between gap-control border-t border-border pt-control-wide"><Typography variant="caption" className="font-bold">{totalLabel}</Typography><strong className="text-body text-primary-strong">{totalValue}</strong><Typography variant="caption" className="w-full">From {new Date(`${startDate}T12:00:00`).toLocaleDateString()} through this day · {total.loggedDays} logged day{total.loggedDays === 1 ? '' : 's'}.</Typography></div>}
        {!total && dateKey <= todayDateKey && <Typography variant="caption" className="mt-content">Choose {new Date(`${startDate}T12:00:00`).toLocaleDateString()} or later to see the total from your saved start date.</Typography>}
      </div>
    </div>
  </Card>
}