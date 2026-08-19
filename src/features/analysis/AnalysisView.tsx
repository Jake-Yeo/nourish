import { ChevronLeft } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { SectionHeader } from '../../components/ui/SectionHeader'
import { Typography } from '../../components/ui/Typography'
import { useAnalysisJobs } from '../../hooks/useAnalysisJobs'
import { fetchAnalysisJob } from '../../services/analysisJobs/analysisJobsApi'
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
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [detailError, setDetailError] = useState('')
  const datedJobs = useMemo(() => jobs.filter(job => job.source.date === selectedDateKey), [jobs, selectedDateKey])
  const selectedDateLabel = getFriendlyDate(selectedDateKey)
  const openJob = async (job: MealAnalysisJob) => {
    setIsLoadingDetail(true); setDetailError('')
    try { setSelectedJob(await fetchAnalysisJob(job.id)) }
    catch (caught) { setDetailError(caught instanceof Error ? caught.message : 'Could not open this analysis.') }
    finally { setIsLoadingDetail(false) }
  }
  useEffect(() => { setSelectedJob(null); setDetailError('') }, [selectedDateKey])
  if (selectedJob) return <div className="grid gap-content"><Button variant="secondary" className="w-fit" onClick={() => setSelectedJob(null)}><ChevronLeft className="w-5" />All analyses</Button><AnalysisJobDetail job={selectedJob} onLog={async (job, estimate) => { const saved = await onLog(job, estimate); if (saved) await refresh(); return saved }} onOpenDiary={onOpenDiary} onRefresh={refresh} onRerun={onRerun} /></div>
  const active = datedJobs.filter(job => job.status === 'queued' || job.status === 'running')
  const history = datedJobs.filter(job => job.status !== 'queued' && job.status !== 'running')
  return <div className="grid gap-section">
    <AnalysisOverviewCard jobs={datedJobs} />
    {(error || detailError) && <Card variant="flat"><Typography className="text-destructive">{error || detailError}</Typography></Card>}
    {isLoadingDetail && <Card variant="flat"><Typography variant="muted">Opening analysis…</Typography></Card>}
    <section><SectionHeader eyebrow="Background work" title="Active analyses" />{active.length ? <div className="grid gap-control">{active.map(job => <AnalysisJobCard job={job} key={job.id} onOpen={() => openJob(job)} />)}</div> : <AnalysisEmptyState kind="active" selectedDateLabel={selectedDateLabel} />}</section>
    <section><SectionHeader eyebrow="Review and history" title="Past analyses" />{history.length ? <div className="grid gap-control">{history.map(job => <AnalysisJobCard job={job} key={job.id} onOpen={() => openJob(job)} />)}</div> : <AnalysisEmptyState kind="history" selectedDateLabel={selectedDateLabel} />}</section>
  </div>
}
