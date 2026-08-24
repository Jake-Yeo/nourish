import { useCallback, useEffect, useState } from 'react'
import { fetchAnalysisJobs } from '../services/analysisJobs/analysisJobsApi'
import type { MealAnalysisJob } from '../types/photoMeal'

export function useAnalysisJobs(queuedJob?: MealAnalysisJob | null) {
  const [jobs, setJobs] = useState<MealAnalysisJob[]>(() => queuedJob ? [queuedJob] : [])
  const [error, setError] = useState('')
  const refresh = useCallback(async () => { try { setJobs(await fetchAnalysisJobs()); setError('') } catch (caught) { setError(caught instanceof Error ? caught.message : 'Could not load meal analyses.') } }, [])
  useEffect(() => {
    if (queuedJob) setJobs(current => [queuedJob, ...current.filter(job => job.id !== queuedJob.id)])
  }, [queuedJob])
  useEffect(() => {
    void refresh()
    const interval = window.setInterval(() => { if (document.visibilityState === 'visible') void refresh() }, 3000)
    return () => window.clearInterval(interval)
  }, [refresh])
  return { error, jobs, refresh }
}
