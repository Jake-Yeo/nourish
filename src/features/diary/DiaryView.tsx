import { useEffect, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { mealTypes, type DiaryEntry, type MealType } from '../../types'
import { MealDiaryCard } from './MealDiaryCard'
import { MoveDiaryModal } from './MoveDiaryModal'

type DiaryViewProps = { entries: DiaryEntry[]; focusMeal: MealType | null; selectedDateKey: string; onAdd: (meal: MealType) => void; onDelete: (id: string) => void; onFocusMealConsumed: () => void; onMove: (ids: string[], date: string, meal: MealType) => Promise<boolean>; onSelect: (entry: DiaryEntry) => void }

export function DiaryView({ entries, focusMeal, selectedDateKey, onAdd, onDelete, onFocusMealConsumed, onMove, onSelect }: DiaryViewProps) {
  const [selectedEntryIds, setSelectedEntryIds] = useState<Set<string>>(new Set())
  const [isMoveOpen, setIsMoveOpen] = useState(false)
  useEffect(() => {
    if (!focusMeal) return
    const target = document.getElementById(`diary-meal-${focusMeal.toLowerCase()}`)
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    target?.focus({ preventScroll: true })
    onFocusMealConsumed()
  }, [focusMeal, onFocusMealConsumed])
  const toggleEntry = (entryId: string) => setSelectedEntryIds(current => { const next = new Set(current); if (next.has(entryId)) next.delete(entryId); else next.add(entryId); return next })
  const moveEntries = async (date: string, meal: MealType) => { if (await onMove([...selectedEntryIds], date, meal)) { setSelectedEntryIds(new Set()); setIsMoveOpen(false) } }
  return <>{selectedEntryIds.size > 0 && <div className="flex items-center justify-between rounded-control border border-primary bg-primary-soft p-control-wide"><span className="text-detail font-bold">{selectedEntryIds.size} item{selectedEntryIds.size === 1 ? '' : 's'} selected</span><Button size="compact" onClick={() => setIsMoveOpen(true)}>Move</Button></div>}{mealTypes.map(mealType => <MealDiaryCard entries={entries} id={`diary-meal-${mealType.toLowerCase()}`} key={mealType} mealType={mealType} selectedEntryIds={selectedEntryIds} onAdd={onAdd} onDelete={onDelete} onSelect={onSelect} onToggle={toggleEntry} />)}{isMoveOpen && <MoveDiaryModal count={selectedEntryIds.size} initialDate={selectedDateKey} onClose={() => setIsMoveOpen(false)} onMove={moveEntries} />}</>
}
