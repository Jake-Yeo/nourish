import { Apple, Trash2 } from 'lucide-react'
import type { DiaryEntry } from '../../types'
import { roundNutrient } from '../../lib/nutrition/roundNutrient'
import { scaleFoodNutrients } from '../../lib/nutrition/scaleFoodNutrients'
import { Button } from '../../components/ui/Button'
import { Typography } from '../../components/ui/Typography'
import { DiarySourceBadge } from './DiarySourceBadge'

type DiaryEntryRowProps = { diaryEntry: DiaryEntry; onDelete: (entryId: string) => void; onSelect: (entry: DiaryEntry) => void }

export function DiaryEntryRow({ diaryEntry, onDelete, onSelect }: DiaryEntryRowProps) {
  const scaledNutrients = scaleFoodNutrients(diaryEntry.food, diaryEntry.servings)
  const selectDiaryEntryWithKeyboard = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') onSelect(diaryEntry)
  }

  return <div className="grid cursor-pointer grid-cols-diary-row items-center gap-control-wide border-t border-border py-control-wide focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/20" role="button" tabIndex={0} onClick={() => onSelect(diaryEntry)} onKeyDown={selectDiaryEntryWithKeyboard}>
    <div className="grid size-icon-small shrink-0 place-items-center overflow-hidden rounded-icon bg-primary-soft text-primary">{diaryEntry.food.image ? <img className="size-full object-cover" src={diaryEntry.food.image} alt="" /> : <Apple className="w-5" />}</div>
    <div className="flex min-w-0 flex-col"><strong className="overflow-hidden text-detail text-ellipsis whitespace-nowrap">{diaryEntry.food.name}</strong><Typography variant="caption">{roundNutrient(diaryEntry.servings, 2)} × {diaryEntry.food.servingLabel}</Typography><DiarySourceBadge source={diaryEntry.source} /></div>
    <div className="flex flex-col items-end"><strong>{Math.round(scaledNutrients.calories)}</strong><Typography variant="caption">cal</Typography></div>
    {diaryEntry.source !== 'mynetdiary' && <Button variant="destructive" size="icon" onClick={event => { event.stopPropagation(); onDelete(diaryEntry.id) }} aria-label={`Delete ${diaryEntry.food.name}`}><Trash2 className="w-4" /></Button>}
  </div>
}
