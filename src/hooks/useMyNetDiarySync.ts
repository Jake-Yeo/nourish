import { useCallback, useEffect, useRef, useState } from 'react'

type SyncStatus = 'queued' | 'running' | 'completed' | 'failed' | 'interrupted'
type SyncJob = { id: string; status: SyncStatus; error?: string | null; summary?: { entryCount: number; exportYear: string; file: string } | null }

async function requestLatestJob() {
  const response = await fetch('/api/sync-mynetdiary')
  const result = await response.json()
  if (!response.ok) throw new Error(result.error || 'Could not check MyNetDiary sync.')
  return result.job as SyncJob | null
}
function completionMessage(job: SyncJob) {
  if (job.status === 'completed') return `Downloaded and synced ${job.summary?.entryCount ?? 0} MyNetDiary food entries`
  if (job.status === 'failed' || job.status === 'interrupted') return job.error || `MyNetDiary sync ${job.status}.`
  return null
}
export function useMyNetDiarySync(showToast: (message: string) => void, refreshNutritionData: () => Promise<unknown>) {
  const [job, setJob] = useState<SyncJob | null>(null)
  const [isQueuing, setIsQueuing] = useState(false)
  const [isRefreshingCompletedSync, setIsRefreshingCompletedSync] = useState(false)
  const jobRef = useRef<SyncJob | null>(null)
  const pending = useRef(false)
  const statusRefreshPending = useRef(false)
  const refreshStatus = useCallback(async () => {
    if (statusRefreshPending.current) return
    statusRefreshPending.current = true
    try {
      const latest = await requestLatestJob()
      const previousJob = jobRef.current
      if (latest?.status === 'completed' && (previousJob?.id !== latest.id || previousJob.status !== 'completed')) {
        setIsRefreshingCompletedSync(true)
        await refreshNutritionData()
      }
      jobRef.current = latest
      setJob(latest)
      setIsRefreshingCompletedSync(false)
      const message = latest && completionMessage(latest)
      const toastKey = latest ? `nourish-mynetdiary-toast-${latest.id}-${latest.status}` : ''
      if (message && !localStorage.getItem(toastKey)) { localStorage.setItem(toastKey, 'shown'); showToast(message) }
    } finally {
      statusRefreshPending.current = false
    }
  }, [refreshNutritionData, showToast])
  useEffect(() => {
    void refreshStatus().catch(() => undefined)
    const checkWhenVisible = () => { if (document.visibilityState === 'visible') void refreshStatus().catch(() => undefined) }
    window.addEventListener('focus', checkWhenVisible); document.addEventListener('visibilitychange', checkWhenVisible)
    return () => { window.removeEventListener('focus', checkWhenVisible); document.removeEventListener('visibilitychange', checkWhenVisible) }
  }, [refreshStatus])
  useEffect(() => {
    if (!isRefreshingCompletedSync && job?.status !== 'queued' && job?.status !== 'running') return
    const interval = window.setInterval(() => { void refreshStatus().catch(() => undefined) }, 3_000)
    return () => window.clearInterval(interval)
  }, [isRefreshingCompletedSync, job?.status, refreshStatus])
  const synchronizeMyNetDiary = async () => {
    if (pending.current || isRefreshingCompletedSync || job?.status === 'queued' || job?.status === 'running') return
    pending.current = true; setIsQueuing(true)
    try {
      const response = await fetch('/api/sync-mynetdiary', { method: 'POST' }); const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'MyNetDiary sync could not be queued.')
      jobRef.current = result.job; setJob(result.job); showToast(result.created ? 'MyNetDiary sync queued' : 'MyNetDiary sync is already active')
    } catch (error) { showToast(error instanceof Error ? error.message : 'MyNetDiary sync could not be queued.') }
    finally { pending.current = false; setIsQueuing(false) }
  }
  const isSyncing = isQueuing || isRefreshingCompletedSync || job?.status === 'queued' || job?.status === 'running'
  return { isSyncing, status: isQueuing ? 'queued' : isRefreshingCompletedSync ? 'running' : job?.status, synchronizeMyNetDiary }
}
