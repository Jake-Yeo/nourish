import { additionalNutrients, primaryNutrients } from '../../constants/nutrients'
import type { DiaryEntry } from '../../types'
import { getFriendlyDate } from '../../lib/dates/getFriendlyDate'
import { roundNutrient } from '../../lib/nutrition/roundNutrient'
import { scaleFoodNutrients } from '../../lib/nutrition/scaleFoodNutrients'
import { Modal } from '../../components/ui/Modal'
import { ModalHeader } from '../../components/ui/ModalHeader'
import { Typography } from '../../components/ui/Typography'

export function EntryDetailModal({ diaryEntry, onClose }: { diaryEntry: DiaryEntry; onClose: () => void }) {
  const scaledNutrients = scaleFoodNutrients(diaryEntry.food, diaryEntry.servings)
  const displayedNutrients = [{ key: 'calories' as const, label: 'Calories', unit: 'kcal' }, ...primaryNutrients, ...additionalNutrients]
  const entrySourceLabel = diaryEntry.source === 'mynetdiary' ? 'MyNetDiary · Read only' : 'Nourish entry'

  return <Modal accessibleLabel={`${diaryEntry.food.name} nutrition details`} onClose={onClose}>
    <ModalHeader eyebrow={entrySourceLabel} title={diaryEntry.food.name} onClose={onClose} />
    <div className="mb-control-wide flex items-center gap-control rounded-control bg-canvas px-content py-control-wide"><Typography variant="caption">{diaryEntry.meal}</Typography><strong className="mr-auto text-detail">{diaryEntry.food.servingLabel}</strong><Typography variant="caption">{getFriendlyDate(diaryEntry.date)}</Typography></div>
    <div className="grid grid-cols-2 gap-control">{displayedNutrients.map(nutrient => <div className="flex items-center justify-between gap-control rounded-field border border-border p-control-wide" key={nutrient.key}><Typography variant="caption">{nutrient.label}</Typography><strong className="text-detail">{roundNutrient(scaledNutrients[nutrient.key], 1)} {nutrient.unit}</strong></div>)}</div>
    {diaryEntry.source === 'mynetdiary' && <p className="mt-control-wide rounded-control bg-info-soft p-control-wide text-caption leading-relaxed text-info">Synced items can only be changed in MyNetDiary. Your next sync will update Nourish.</p>}
  </Modal>
}
