import { Plus } from 'lucide-react'
import type { DiaryEntry, MealType } from '../../types'
import { getTotalNutrients } from '../../lib/nutrition/getTotalNutrients'
import { roundNutrient } from '../../lib/nutrition/roundNutrient'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Typography } from '../../components/ui/Typography'
import { DiaryEntryRow } from './DiaryEntryRow'

type MealDiaryCardProps = { entries: DiaryEntry[]; mealType: MealType; onAdd: (meal: MealType) => void; onDelete: (id: string) => void; onSelect: (entry: DiaryEntry) => void }

export function MealDiaryCard({ entries, mealType, onAdd, onDelete, onSelect }: MealDiaryCardProps) {
  const mealEntries = entries.filter(entry => entry.meal === mealType)
  const totalNutrients = getTotalNutrients(mealEntries)
  return <Card variant="flat">
    <div className="flex items-center justify-between pb-control-wide"><div><Typography as="h2" variant="sectionTitle">{mealType}</Typography><Typography variant="caption">{Math.round(totalNutrients.calories)} cal · {roundNutrient(totalNutrients.protein, 1)}g protein</Typography></div><Button size="icon" onClick={() => onAdd(mealType)}><Plus className="w-5" /></Button></div>
    {mealEntries.length === 0
      ? <Button variant="ghost" fullWidth className="border border-dashed border-border bg-canvas" onClick={() => onAdd(mealType)}>Add {mealType.toLowerCase()}</Button>
      : mealEntries.map(diaryEntry => <DiaryEntryRow diaryEntry={diaryEntry} key={diaryEntry.id} onDelete={onDelete} onSelect={onSelect} />)}
  </Card>
}
