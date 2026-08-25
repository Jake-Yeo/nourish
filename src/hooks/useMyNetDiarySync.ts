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
export function useMyNetDiarySync(showToast: (message: string) => void) {
  const [job, setJob] = useState<SyncJob | null>(null)
  const [isQueuing, setIsQueuing] = useState(false)
  const pending = useRef(false)
  const refreshStatus = useCallback(async () => {
    const latest = await requestLatestJob(); setJob(latest)
    const message = latest && completionMessage(latest)
    const toastKey = latest ? `nourish-mynetdiary-toast-${latest.id}-${latest.status}` : ''
    if (message && !localStorage.getItem(toastKey)) { localStorage.setItem(toastKey, 'shown'); showToast(message) }
  }, [showToast])
  useEffect(() => {
    void refreshStatus().catch(() => undefined)
    const checkWhenVisible = () => { if (document.visibilityState === 'visible') void refreshStatus().catch(() => undefined) }
    const interval = window.setInterval(() => { if (job?.status === 'queued' || job?.status === 'running') void refreshStatus().catch(() => undefined) }, 3_000)
    window.addEventListener('focus', checkWhenVisible); document.addEventListener('visibilitychange', checkWhenVisible)
    return () => { window.clearInterval(interval); window.removeEventListener('focus', checkWhenVisible); document.removeEventListener('visibilitychange', checkWhenVisible) }
  }, [job?.status, refreshStatus])
  const synchronizeMyNetDiary = async () => {
    if (pending.current || job?.status === 'queued' || job?.status === 'running') return
    pending.current = true; setIsQueuing(true)
    try {
      const response = await fetch('/api/sync-mynetdiary', { method: 'POST' }); const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'MyNetDiary sync could not be queued.')
      setJob(result.job); showToast(result.created ? 'MyNetDiary sync queued' : 'MyNetDiary sync is already active')
    } catch (error) { showToast(error instanceof Error ? error.message : 'MyNetDiary sync could not be queued.') }
    finally { pending.current = false; setIsQueuing(false) }
  }
  const isSyncing = isQueuing || job?.status === 'queued' || job?.status === 'running'
  return { isSyncing, status: isQueuing ? 'queued' : job?.status, synchronizeMyNetDiary }
}
