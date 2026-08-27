import { BookOpen, Clock3, RotateCcw, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { SectionHeader } from '../../components/ui/SectionHeader'
import { Typography } from '../../components/ui/Typography'
import { createEmptyNutrients } from '../../lib/nutrition/createEmptyNutrients'
import { retryAnalysisJob } from '../../services/analysisJobs/analysisJobsApi'
import type { Nutrients } from '../../types'
import type { MealAnalysisJob, MealEstimate } from '../../types/photoMeal'
import { MealEstimateReview } from '../photoMeal/MealEstimateReview'

type Props = { job: MealAnalysisJob; onDelete: (job: MealAnalysisJob) => Promise<void>; onLog: (job: MealAnalysisJob, estimate: MealEstimate) => Promise<boolean>; onOpenDiary: (job: MealAnalysisJob) => void; onRefresh: () => Promise<void> | void; onRerun: (job: MealAnalysisJob) => void }
export function AnalysisJobDetail({ job, onDelete, onLog, onOpenDiary, onRefresh, onRerun }: Props) {
  const [estimate, setEstimate] = useState(job.result)
  const [action, setAction] = useState<'retry' | 'log' | 'delete' | null>(null)
  const [actionError, setActionError] = useState('')
  const pending = useRef(false)
  useEffect(() => setEstimate(job.result), [job])
  const updateField = (index: number, field: 'name' | 'description' | 'portion', value: string) => setEstimate(current => current ? { ...current, items: current.items.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item) } : null)
  const updateNutrient = (index: number, name: keyof Nutrients, value: number) => setEstimate(current => {
    if (!current) return null
    const items = current.items.map((item, itemIndex) => itemIndex === index ? { ...item, nutrients: { ...item.nutrients, [name]: value } } : item)
    const totals = items.reduce((sum, item) => { for (const key of Object.keys(sum) as Array<keyof Nutrients>) sum[key] += item.nutrients[key]; return sum }, createEmptyNutrients())
    return { ...current, items, totals, calorieBreakdown: name === 'calories' ? undefined : current.calorieBreakdown }
  })
  const runAction = async (name: Exclude<typeof action, null>, task: () => Promise<unknown>) => {
    if (pending.current) return
    pending.current = true; setAction(name); setActionError('')
    try { await task() } catch (caught) { setActionError(caught instanceof Error ? caught.message : 'The action could not be completed.') }
    finally { pending.current = false; setAction(null) }
  }
  const retry = () => runAction('retry', async () => { await retryAnalysisJob(job.id); await onRefresh() })
  const log = () => estimate && runAction('log', () => onLog(job, estimate))
  const remove = () => runAction('delete', () => onDelete(job))
  return <div className="grid gap-content">
    <section><SectionHeader eyebrow="Analysis detail" title={job.result?.mealName || `${job.source.mealType} analysis`} /><Card className="grid gap-content"><div className="flex flex-wrap items-center gap-control"><Badge variant="ai"><Sparkles className="w-4" />{job.source.mealType}</Badge><Typography variant="caption" className="font-bold">{job.source.date}</Typography></div>{job.source.note && <Typography variant="muted">{job.source.note}</Typography>}<div className="grid grid-cols-3 gap-control">{job.source.items.flatMap(item => item.photos).map(photo => <img className="aspect-square min-w-0 w-full rounded-control object-cover" src={photo.dataUrl} alt="Meal source" key={photo.id} />)}</div></Card></section>
    {actionError && <Card variant="flat" className="border-destructive bg-destructive-soft"><Typography className="text-destructive">{actionError}</Typography></Card>}
    {(job.status === 'failed' || job.status === 'interrupted') && <Card variant="flat" className="border-destructive bg-destructive-soft"><Badge variant="destructive">Needs attention</Badge><Typography className="mt-control-wide font-bold text-destructive">Analysis did not finish</Typography><Typography variant="muted" className="mt-control">{job.error || 'The background analysis was interrupted.'}</Typography><Button className="mt-content" loading={action === 'retry'} onClick={() => void retry()}><RotateCcw className="w-5" />{action === 'retry' ? 'Queuing retry…' : 'Retry analysis'}</Button></Card>}
    {(job.status === 'queued' || job.status === 'running') && <Card variant="soft"><Badge variant="ai"><Clock3 className="w-4" />{job.status === 'queued' ? 'Queued' : 'In progress'}</Badge><Typography variant="body" className="mt-control-wide font-bold">Analysis is running in the background</Typography><Typography variant="muted" className="mt-control">You can close Nourish and return later. Your source photos and progress stay with this analysis.</Typography></Card>}
    {job.status === 'completed' && estimate && <>{job.error && <Card variant="flat" className="border-warning bg-warning-soft"><Typography className="text-warning">The latest re-run did not finish, so Nourish restored the previous analysis. {job.error}</Typography></Card>}{job.loggedAt && !job.diaryUpdatePending ? <Card variant="soft"><Badge>Complete</Badge><Typography variant="body" className="mt-control-wide font-bold">Logged to your diary</Typography><Typography variant="muted" className="mt-control">You can add details and re-run this analysis whenever the linked Diary item needs a better estimate.</Typography><div className="mt-content grid gap-control"><Button onClick={() => onOpenDiary(job)}><BookOpen className="w-5" />Open in Diary</Button><Button variant="secondary" disabled={action !== null} onClick={() => onRerun(job)}><RotateCcw className="w-5" />Edit photos &amp; notes, then re-run AI</Button></div></Card> : <section><SectionHeader eyebrow={job.loggedAt ? 'Updated analysis' : 'Ready to review'} title={job.loggedAt ? 'Review before updating Diary' : 'Check your estimate'} /><MealEstimateReview actionLabel={job.loggedAt ? 'Update logged meal' : undefined} estimate={estimate} isDeleting={action === 'delete'} isLogging={action === 'log'} mealType={job.source.mealType} onDelete={job.loggedAt ? undefined : () => void remove()} onFieldChange={updateField} onNutrientChange={updateNutrient} onLog={() => void log()} requireConfirmation={Boolean(job.loggedAt)} reviewTitle={job.loggedAt ? 'Review before updating Diary' : undefined} /><Button fullWidth variant="secondary" className="mt-control-wide" disabled={action !== null} onClick={() => onRerun(job)}><RotateCcw className="w-5" />Edit photos &amp; notes, then re-run AI</Button></section>}</>}
  </div>
}
