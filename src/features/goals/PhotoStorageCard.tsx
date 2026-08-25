import { useEffect, useRef, useState } from 'react'
import { Trash2 } from 'lucide-react'
import type { PhotoStorageUsage } from '../../types/savedPhotoMeal'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Typography } from '../../components/ui/Typography'

function readableBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`
}

export function PhotoStorageCard() {
  const [usage, setUsage] = useState<PhotoStorageUsage | null>(null)
  const [error, setError] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const pending = useRef(false)
  const refresh = () => fetch('/api/photo-meals/storage').then(response => response.json()).then(setUsage).catch(() => setError('Could not load photo storage usage.'))
  useEffect(() => { void refresh() }, [])
  const clear = async () => {
    if (pending.current) return
    pending.current = true; setIsClearing(true)
    try {
      const response = await fetch('/api/photo-meals', { method: 'DELETE' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error)
      setUsage(result); setConfirming(false); setError('Saved photos and notes cleared. Diary entries were preserved.')
    } catch { setError('Could not clear saved photos.') }
    finally { pending.current = false; setIsClearing(false) }
  }
  return <Card variant="flat" className="grid gap-control-wide">
    <div><Typography variant="eyebrow">Photo storage</Typography><h2 className="text-section font-bold">Saved meal photos</h2></div>
    {usage ? <p className="text-detail"><strong>{readableBytes(usage.bytes)}</strong> · {usage.photoCount} photo{usage.photoCount === 1 ? '' : 's'} across {usage.mealCount} meal{usage.mealCount === 1 ? '' : 's'}</p> : <p className="text-caption text-muted">Loading usage…</p>}
    {error && <p role="status" className="rounded-field bg-info-soft p-control text-caption text-info">{error}</p>}
    {confirming ? <div className="grid gap-control rounded-control bg-destructive-soft p-control-wide"><p className="text-caption text-destructive">Delete all saved meal photos and notes? Nutrition diary entries and goals will remain.</p><div className="flex gap-control"><Button variant="secondary" disabled={isClearing} onClick={() => setConfirming(false)}>Cancel</Button><Button variant="destructive" loading={isClearing} onClick={() => void clear()}><Trash2 />{isClearing ? 'Clearing photos…' : 'Clear photos'}</Button></div></div> : <Button variant="destructive" disabled={!usage?.photoCount} onClick={() => setConfirming(true)}><Trash2 />Clear photos</Button>}
  </Card>
}
