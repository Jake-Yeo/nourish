import { ChevronRight, Clock3, LoaderCircle } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { Typography } from '../../components/ui/Typography'
import type { MealAnalysisJob } from '../../types/photoMeal'

const variants = { queued: 'warning', running: 'ai', completed: 'primary', failed: 'destructive', interrupted: 'neutral' } as const
const statusLabels = { queued: 'Queued', running: 'Running', completed: 'Complete', failed: 'Failed', interrupted: 'Interrupted' }

export function AnalysisJobCard({ disabled, isOpening, job, onOpen }: { disabled?: boolean; isOpening?: boolean; job: MealAnalysisJob; onOpen: () => void }) {
  const title = job.result?.mealName || job.source.items.map(item => item.name || 'Photo item').join(', ')
  const summary = job.diaryUpdatePending ? 'Updated estimate ready to apply to Diary' : job.loggedAt ? 'Logged to your diary' : job.status === 'completed' ? job.result?.summary || 'Estimate ready to review' : job.error || `Analysis attempt ${job.attempt}`
  const timestamp = new Date(job.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  return <button disabled={disabled} aria-busy={isOpening || undefined} className="w-full min-w-0 cursor-pointer rounded-card text-left focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/20 disabled:cursor-wait disabled:opacity-70" onClick={onOpen} aria-label={`${isOpening ? 'Opening' : 'Open'} ${title} analysis`}>
    <Card className="grid min-w-0 gap-control transition hover:border-primary hover:shadow-primary" padding="default">
      <div className="flex min-w-0 items-start gap-control-wide">
        <div className="min-w-0 flex-1"><Typography variant="eyebrow" className="truncate">{job.source.mealType} · {job.source.date}</Typography><Typography as="h3" variant="sectionTitle" className="mt-control truncate">{title}</Typography></div>
        <Badge size="compact" variant={variants[job.status]} className="shrink-0">{statusLabels[job.status]}</Badge>
      </div>
      <Typography variant="muted" className="line-clamp-2">{summary}</Typography>
      <div className="flex items-center justify-between border-t border-border pt-control-wide"><span className="flex items-center gap-control text-caption font-bold text-muted"><Clock3 className="w-4" aria-hidden="true" />Updated {timestamp}</span><span className="flex items-center gap-badge text-detail font-bold text-primary">{isOpening ? <><LoaderCircle className="w-4 animate-spin" aria-hidden="true" />Opening…</> : <>View<ChevronRight className="w-4" aria-hidden="true" /></>}</span></div>
    </Card>
  </button>
}
