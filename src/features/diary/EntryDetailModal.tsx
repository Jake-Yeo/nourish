import { additionalNutrients, primaryNutrients } from '../../constants/nutrients'
import type { DiaryEntry } from '../../types'
import { getFriendlyDate } from '../../lib/dates/getFriendlyDate'
import { roundNutrient } from '../../lib/nutrition/roundNutrient'
import { scaleFoodNutrients } from '../../lib/nutrition/scaleFoodNutrients'
import { Modal } from '../../components/ui/Modal'
import { ModalHeader } from '../../components/ui/ModalHeader'
import { Typography } from '../../components/ui/Typography'
import { SavedMealPanel } from './SavedMealPanel'

export function EntryDetailModal({ diaryEntry, onClose }: { diaryEntry: DiaryEntry; onClose: () => void }) {
  const scaledNutrients = scaleFoodNutrients(diaryEntry.food, diaryEntry.servings)
  const displayedNutrients = [{ key: 'calories' as const, label: 'Calories', unit: 'kcal' }, ...primaryNutrients, ...additionalNutrients]
  const entrySourceLabel = diaryEntry.source === 'mynetdiary' ? 'MyNetDiary · Read only' : 'Nourish entry'

  return <Modal accessibleLabel={`${diaryEntry.food.name} nutrition details`} onClose={onClose}>
    <ModalHeader eyebrow={entrySourceLabel} title={diaryEntry.food.name} onClose={onClose} />
    <div className="mb-control-wide flex items-center gap-control rounded-control bg-canvas px-content py-control-wide"><Typography variant="caption">{diaryEntry.meal}</Typography><strong className="mr-auto text-detail">{diaryEntry.food.servingLabel}</strong><Typography variant="caption">{getFriendlyDate(diaryEntry.date)}</Typography></div>
    <div className="grid grid-cols-2 gap-control">{displayedNutrients.map(nutrient => <div className="flex items-center justify-between gap-control rounded-field border border-border p-control-wide" key={nutrient.key}><Typography variant="caption">{nutrient.label}</Typography><strong className="text-detail">{roundNutrient(scaledNutrients[nutrient.key], 1)} {nutrient.unit}</strong></div>)}</div>
    {diaryEntry.aiPhotoExplanation && <div className="mt-control-wide rounded-control bg-ai-soft p-control-wide"><Typography variant="eyebrow" className="text-ai">Why Nourish logged this</Typography><Typography variant="caption" className="mt-control block leading-relaxed">{diaryEntry.aiPhotoExplanation.summary}</Typography><Typography variant="caption" className="mt-control block font-bold text-ink">{diaryEntry.aiPhotoExplanation.confidence} confidence</Typography>{diaryEntry.aiPhotoExplanation.assumptions.length > 0 && <details className="mt-control text-caption text-muted"><summary className="cursor-pointer font-bold text-ink">AI assumptions</summary><ul className="mt-control list-disc pl-content leading-relaxed">{diaryEntry.aiPhotoExplanation.assumptions.map((assumption, index) => <li key={index}>{assumption}</li>)}</ul></details>}</div>}
    {diaryEntry.source === 'nourish-photo' && <SavedMealPanel entry={diaryEntry} />}
    {diaryEntry.source === 'mynetdiary' && <p className="mt-control-wide rounded-control bg-info-soft p-control-wide text-caption leading-relaxed text-info">Synced items can only be changed in MyNetDiary. Your next sync will update Nourish.</p>}
  </Modal>
}
