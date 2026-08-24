import { useEffect, useState } from 'react'
import type { DiaryEntry } from '../../types'
import type { CaptureFoodItem } from '../../types/photoMeal'
import type { SavedPhotoMeal } from '../../types/savedPhotoMeal'
import { useMealEstimate } from '../../hooks/useMealEstimate'
import { Button } from '../../components/ui/Button'
import { Typography } from '../../components/ui/Typography'
import { CapturedPhotoGrid } from '../photoMeal/CapturedPhotoGrid'

async function request(url: string, options?: RequestInit) {
  const response = await fetch(url, options); const result = await response.json()
  if (!response.ok) throw new Error(result.error || 'Could not load saved food item.')
  return result
}
export function SavedMealPanel({ entry }: { entry: DiaryEntry }) {
  const [meal, setMeal] = useState<SavedPhotoMeal | null>(null)
  const [error, setError] = useState('')
  const estimate = useMealEstimate()
  const item = meal?.items[0]
  useEffect(() => { request(`/api/photo-meals/entry/${entry.id}`).then(setMeal).catch(caught => setError(caught instanceof Error ? caught.message : 'Could not load saved photos.')) }, [entry.id])
  const saveNotes = async () => {
    if (!meal || !item) return
    try { await request(`/api/photo-meals/${meal.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ item }) }); setError('Item details saved.') }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Could not save item details.') }
  }
  const rerun = async (captureItem: CaptureFoodItem) => {
    if (!meal || !item) return
    const queued = await estimate.queueMealAnalysis([captureItem], meal.mealNote, entry.meal, entry.date, { mealId: meal.id, itemId: item.id, entryId: entry.id })
    setError(queued ? 'Analysis queued. Review it in Analysis before replacing this item.' : '')
  }
  if (error && !meal) return <p className="mt-control-wide rounded-field bg-info-soft p-control-wide text-caption text-info">{error}</p>
  if (!meal) return <p className="mt-control-wide text-caption text-muted">Loading saved photos…</p>
  if (meal.readOnlyLegacy) return <LegacySavedPhotos meal={meal} />
  if (!item) return null
  const captureItem: CaptureFoodItem = { id: item.id, name: item.name, description: item.description, photos: item.photos }
  return <div className="mt-control-wide grid gap-control-wide">
    <div><Typography variant="eyebrow">Saved food item</Typography><strong className="mt-control block text-body">{item.name}</strong><Typography variant="caption" className="mt-control block">{item.description || 'No description saved.'}</Typography></div>
    <CapturedPhotoGrid readOnly photos={item.photos} onChooseFromLibrary={() => undefined} onTakePhoto={() => undefined} onDelete={() => undefined} onNoteChange={() => undefined} />
    {(error || estimate.analysisError) && <p className="rounded-field bg-info-soft p-control-wide text-caption text-info" role="status">{error || estimate.analysisError}</p>}
    <div className="flex gap-control"><Button variant="secondary" onClick={saveNotes}>Save item details</Button><Button disabled={estimate.isQueuing} onClick={() => void rerun(captureItem)}>{estimate.isQueuing ? 'Queuing…' : 'Re-run AI for this item'}</Button></div>
  </div>
}
function LegacySavedPhotos({ meal }: { meal: SavedPhotoMeal }) {
  return <div className="mt-control-wide grid gap-control"><p className="rounded-field bg-info-soft p-control-wide text-caption text-info">This older saved meal has no item grouping. It is available read-only.</p><CapturedPhotoGrid readOnly photos={meal.legacyPhotos || []} onChooseFromLibrary={() => undefined} onTakePhoto={() => undefined} onDelete={() => undefined} onNoteChange={() => undefined} /></div>
}
