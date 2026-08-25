import { ChevronLeft } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { SectionHeader } from '../../components/ui/SectionHeader'
import { Typography } from '../../components/ui/Typography'
import { useAnalysisJobs } from '../../hooks/useAnalysisJobs'
import { deleteAnalysisJob, fetchAnalysisJob } from '../../services/analysisJobs/analysisJobsApi'
import { getFriendlyDate } from '../../lib/dates/getFriendlyDate'
import type { MealAnalysisJob, MealEstimate } from '../../types/photoMeal'
import { AnalysisEmptyState } from './AnalysisEmptyState'
import { AnalysisJobCard } from './AnalysisJobCard'
import { AnalysisJobDetail } from './AnalysisJobDetail'
import { AnalysisOverviewCard } from './AnalysisOverviewCard'

type AnalysisViewProps = { selectedDateKey: string; queuedJob?: MealAnalysisJob | null; onLog: (job: MealAnalysisJob, estimate: MealEstimate) => Promise<boolean>; onOpenDiary: (job: MealAnalysisJob) => void; onRerun: (job: MealAnalysisJob) => void }

export function AnalysisView({ selectedDateKey, queuedJob, onLog, onOpenDiary, onRerun }: AnalysisViewProps) {
  const { error, jobs, refresh } = useAnalysisJobs(queuedJob)
  const [selectedJob, setSelectedJob] = useState<MealAnalysisJob | null>(null)
  const [openingJobId, setOpeningJobId] = useState<string | null>(null)
  const [detailError, setDetailError] = useState('')
  const opening = useRef(false)
  const datedJobs = useMemo(() => jobs.filter(job => job.source.date === selectedDateKey), [jobs, selectedDateKey])
  const selectedDateLabel = getFriendlyDate(selectedDateKey)
  const openJob = async (job: MealAnalysisJob) => {
    if (opening.current) return
    opening.current = true; setOpeningJobId(job.id); setDetailError('')
    try { setSelectedJob(await fetchAnalysisJob(job.id)) }
    catch (caught) { setDetailError(caught instanceof Error ? caught.message : 'Could not open this analysis.') }
    finally { opening.current = false; setOpeningJobId(null) }
  }
  const removeJob = async (job: MealAnalysisJob) => {
    try { await deleteAnalysisJob(job.id); setSelectedJob(null); setDetailError(''); await refresh() }
    catch (caught) { setDetailError(caught instanceof Error ? caught.message : 'Could not delete this analysis.') }
  }
  useEffect(() => { setSelectedJob(null); setDetailError('') }, [selectedDateKey])
  useEffect(() => { if (queuedJob?.status === 'queued') { setSelectedJob(null); setDetailError('') } }, [queuedJob])
  if (selectedJob) return <div className="grid gap-content"><Button variant="secondary" className="w-fit" onClick={() => setSelectedJob(null)}><ChevronLeft className="w-5" />All analyses</Button>{detailError && <Card variant="flat"><Typography className="text-destructive">{detailError}</Typography></Card>}<AnalysisJobDetail job={selectedJob} onDelete={removeJob} onLog={async (job, estimate) => { const saved = await onLog(job, estimate); if (saved) await refresh(); return saved }} onOpenDiary={onOpenDiary} onRefresh={refresh} onRerun={onRerun} /></div>
  const active = datedJobs.filter(job => job.status === 'queued' || job.status === 'running')
  const history = datedJobs.filter(job => job.status !== 'queued' && job.status !== 'running')
  const card = (job: MealAnalysisJob) => <AnalysisJobCard disabled={openingJobId !== null} isOpening={openingJobId === job.id} job={job} key={job.id} onOpen={() => void openJob(job)} />
  return <div className="grid gap-section">
    <AnalysisOverviewCard jobs={datedJobs} />
    {(error || detailError) && <Card variant="flat"><Typography className="text-destructive">{error || detailError}</Typography></Card>}
    <section><SectionHeader eyebrow="Background work" title="Active analyses" />{active.length ? <div className="grid gap-control">{active.map(card)}</div> : <AnalysisEmptyState kind="active" selectedDateLabel={selectedDateLabel} />}</section>
    <section><SectionHeader eyebrow="Review and history" title="Past analyses" />{history.length ? <div className="grid gap-control">{history.map(card)}</div> : <AnalysisEmptyState kind="history" selectedDateLabel={selectedDateLabel} />}</section>
  </div>
}
