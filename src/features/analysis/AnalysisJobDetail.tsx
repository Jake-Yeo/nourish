import { BookOpen, Clock3, RotateCcw, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
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

export function AnalysisJobDetail({ job, onLog, onOpenDiary, onRefresh, onRerun }: { job: MealAnalysisJob; onLog: (job: MealAnalysisJob, estimate: MealEstimate) => Promise<boolean>; onOpenDiary: (job: MealAnalysisJob) => void; onRefresh: () => void; onRerun: (job: MealAnalysisJob) => void }) {
  const [estimate, setEstimate] = useState(job.result)
  useEffect(() => setEstimate(job.result), [job])
  const updateField = (index: number, field: 'name' | 'description' | 'portion', value: string) => setEstimate(current => current ? { ...current, items: current.items.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item) } : null)
  const updateNutrient = (index: number, name: keyof Nutrients, value: number) => setEstimate(current => {
    if (!current) return null
    const items = current.items.map((item, itemIndex) => itemIndex === index ? { ...item, nutrients: { ...item.nutrients, [name]: value } } : item)
    const totals = items.reduce((sum, item) => { for (const key of Object.keys(sum) as Array<keyof Nutrients>) sum[key] += item.nutrients[key]; return sum }, createEmptyNutrients())
    return { ...current, items, totals }
  })
  const retry = async () => { await retryAnalysisJob(job.id); onRefresh() }
  return <div className="grid gap-content">
    <section><SectionHeader eyebrow="Analysis detail" title={job.result?.mealName || `${job.source.mealType} analysis`} /><Card className="grid gap-content"><div className="flex flex-wrap items-center gap-control"><Badge variant="ai"><Sparkles className="w-4" />{job.source.mealType}</Badge><Typography variant="caption" className="font-bold">{job.source.date}</Typography></div>{job.source.note && <Typography variant="muted">{job.source.note}</Typography>}<div className="grid grid-cols-3 gap-control">{job.source.items.flatMap(item => item.photos).map(photo => <img className="aspect-square min-w-0 w-full rounded-control object-cover" src={photo.dataUrl} alt="Meal source" key={photo.id} />)}</div></Card></section>
    {(job.status === 'failed' || job.status === 'interrupted') && <Card variant="flat" className="border-destructive bg-destructive-soft"><Badge variant="destructive">Needs attention</Badge><Typography className="mt-control-wide font-bold text-destructive">Analysis did not finish</Typography><Typography variant="muted" className="mt-control">{job.error || 'The background analysis was interrupted.'}</Typography><Button className="mt-content" onClick={retry}><RotateCcw className="w-5" />Retry analysis</Button></Card>}
    {(job.status === 'queued' || job.status === 'running') && <Card variant="soft"><Badge variant="ai"><Clock3 className="w-4" />{job.status === 'queued' ? 'Queued' : 'In progress'}</Badge><Typography variant="body" className="mt-control-wide font-bold">Analysis is running in the background</Typography><Typography variant="muted" className="mt-control">You can close Nourish and return later. Your source photos and progress stay with this analysis.</Typography></Card>}
    {job.status === 'completed' && estimate && (job.loggedAt ? <Card variant="soft"><Badge>Complete</Badge><Typography variant="body" className="mt-control-wide font-bold">Logged to your diary</Typography><Typography variant="muted" className="mt-control">This estimate remains available here as analysis history.</Typography><Button className="mt-content" onClick={() => onOpenDiary(job)}><BookOpen className="w-5" />Open in Diary</Button></Card> : <section><SectionHeader eyebrow="Ready to review" title="Check your estimate" /><MealEstimateReview estimate={estimate} mealType={job.source.mealType} onFieldChange={updateField} onNutrientChange={updateNutrient} onLog={() => void onLog(job, estimate)} /><Button fullWidth variant="secondary" className="mt-control-wide" onClick={() => onRerun(job)}><RotateCcw className="w-5" />Edit photos &amp; notes, then re-run AI</Button></section>)}
  </div>
}
