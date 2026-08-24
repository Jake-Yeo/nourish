import { CheckCircle2, Clock3 } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Typography } from '../../components/ui/Typography'

export function AnalysisEmptyState({ kind, selectedDateLabel }: { kind: 'active' | 'history'; selectedDateLabel: string }) {
  const Icon = kind === 'active' ? Clock3 : CheckCircle2
  return <Card variant="flat" className="grid place-items-center border-dashed py-card-large text-center">
    <div className="mb-control-wide grid size-icon-medium place-items-center rounded-full bg-primary-soft text-primary"><Icon className="w-5" aria-hidden="true" /></div>
    <Typography as="h3" variant="body" className="font-bold">{kind === 'active' ? `Nothing running for ${selectedDateLabel}` : `No analysis history for ${selectedDateLabel}`}</Typography>
    <Typography variant="muted" className="mt-control max-w-xs">{kind === 'active' ? 'Photo analyses queued for this date will appear here while Nourish works.' : 'Completed and interrupted analyses for this date will appear here.'}</Typography>
  </Card>
}
