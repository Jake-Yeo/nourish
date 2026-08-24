import { Beef } from 'lucide-react'
import type { AppData } from '../../types'
import { Card } from '../../components/ui/Card'
import { Typography } from '../../components/ui/Typography'
import { getWeeklyProteinAverage } from './getWeeklyProteinAverage'

export function WeeklyProteinAverageCard({ endingDateKey, nutritionData }: { endingDateKey: string; nutritionData: AppData }) {
  const averageProtein = getWeeklyProteinAverage(nutritionData, endingDateKey)

  return <Card variant="soft" className="flex items-center gap-card">
    <div className="flex size-12 shrink-0 items-center justify-center rounded-control bg-surface text-primary shadow-card"><Beef aria-hidden="true" /></div>
    <div className="min-w-0">
      <Typography variant="eyebrow">This week so far</Typography>
      <Typography as="h2" variant="sectionTitle" className="mt-control">Weekly protein average</Typography>
      <Typography className="mt-control"><strong className="text-2xl font-extrabold tracking-tight text-ink">{Math.round(averageProtein)}g</strong> <span className="text-muted">per day</span></Typography>
    </div>
  </Card>
}
