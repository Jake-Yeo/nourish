import { CheckCircle2, Clock3, Sparkles } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { Typography } from '../../components/ui/Typography'
import type { MealAnalysisJob } from '../../types/photoMeal'

export function AnalysisOverviewCard({ jobs }: { jobs: MealAnalysisJob[] }) {
  const activeCount = jobs.filter(job => job.status === 'queued' || job.status === 'running').length
  const reviewCount = jobs.filter(job => job.status === 'completed' && (!job.loggedAt || job.diaryUpdatePending)).length
  const completedCount = jobs.filter(job => job.status === 'completed').length
  return <Card padding="large" className="overflow-hidden">
    <Badge variant="ai"><Sparkles className="w-4" />Analysis center</Badge>
    <Typography as="h2" variant="sectionTitle" className="mt-control-wide max-w-sm">
      {activeCount ? `${activeCount} meal ${activeCount === 1 ? 'is' : 'are'} being analyzed` : reviewCount ? `${reviewCount} estimate${reviewCount === 1 ? '' : 's'} ready to review` : 'Your meal analysis workspace'}
    </Typography>
    <Typography variant="muted" className="mt-control">Analysis continues safely in the background, even when you leave this screen.</Typography>
    <div className="mt-content grid grid-cols-3 gap-control rounded-sheet bg-canvas p-content">
      <OverviewMetric icon={Clock3} label="Active" value={activeCount} />
      <OverviewMetric icon={Sparkles} label="To review" value={reviewCount} />
      <OverviewMetric icon={CheckCircle2} label="Complete" value={completedCount} />
    </div>
  </Card>
}

function OverviewMetric({ icon: Icon, label, value }: { icon: typeof Clock3; label: string; value: number }) {
  return <div className="min-w-0 text-center"><Icon className="mx-auto mb-control w-4 text-primary" aria-hidden="true" /><strong className="block text-xl text-ink">{value}</strong><Typography variant="caption" className="truncate">{label}</Typography></div>
}
