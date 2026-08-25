import { Plus } from 'lucide-react'
import type { DiaryEntry, MealType } from '../../types'
import { getTotalNutrients } from '../../lib/nutrition/getTotalNutrients'
import { roundNutrient } from '../../lib/nutrition/roundNutrient'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Typography } from '../../components/ui/Typography'
import { DiaryEntryRow } from './DiaryEntryRow'

type MealDiaryCardProps = { deletingEntryIds: Set<string>; entries: DiaryEntry[]; id: string; mealType: MealType; selectedEntryIds: Set<string>; onAdd: (meal: MealType) => void; onDelete: (id: string) => void; onSelect: (entry: DiaryEntry) => void; onToggle: (entryId: string) => void }

export function MealDiaryCard({ deletingEntryIds, entries, id, mealType, selectedEntryIds, onAdd, onDelete, onSelect, onToggle }: MealDiaryCardProps) {
  const mealEntries = entries.filter(entry => entry.meal === mealType)
  const totalNutrients = getTotalNutrients(mealEntries)
  return <Card variant="flat" id={id} tabIndex={-1} aria-label={`${mealType} diary section`} className="scroll-mt-content focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/20">
    <div className="flex items-center justify-between pb-control-wide"><div><Typography as="h2" variant="sectionTitle">{mealType}</Typography><Typography variant="caption">{Math.round(totalNutrients.calories)} cal · {roundNutrient(totalNutrients.protein, 1)}g protein</Typography></div><Button size="icon" onClick={() => onAdd(mealType)}><Plus className="w-5" /></Button></div>
    {mealEntries.length === 0
      ? <Button variant="ghost" fullWidth className="rounded-button border border-dashed border-border bg-canvas" onClick={() => onAdd(mealType)}>Add {mealType.toLowerCase()}</Button>
      : mealEntries.map(diaryEntry => <DiaryEntryRow diaryEntry={diaryEntry} isDeleting={deletingEntryIds.has(diaryEntry.id)} isSelected={selectedEntryIds.has(diaryEntry.id)} key={diaryEntry.id} onDelete={onDelete} onSelect={onSelect} onToggle={onToggle} />)}
  </Card>
}
