import { Apple, Plus } from 'lucide-react'
import { cva } from 'class-variance-authority'
import type { DiaryEntry, MealType } from '../../types'
import { getTotalNutrients } from '../../lib/nutrition/getTotalNutrients'
import { Button } from '../../components/ui/Button'
import { Typography } from '../../components/ui/Typography'

const mealIconVariants = cva('grid size-icon-small shrink-0 place-items-center rounded-icon', {
  variants: { meal: { Breakfast: 'bg-primary-soft text-primary', Lunch: 'bg-lunch-soft text-lunch', Dinner: 'bg-dinner-soft text-dinner', Snacks: 'bg-snacks-soft text-snacks' } },
})

export function MealPreviewRow({ entries, mealType, onOpen, onQuickAdd }: { entries: DiaryEntry[]; mealType: MealType; onOpen: () => void; onQuickAdd: (mealType: MealType) => void }) {
  const mealEntries = entries.filter(entry => entry.meal === mealType)
  const mealCalories = getTotalNutrients(mealEntries).calories
  return <div className="flex items-center gap-control border-t border-border py-control">
    <button type="button" className="grid min-h-12 min-w-0 flex-1 cursor-pointer grid-cols-diary-row items-center gap-control-wide rounded-control text-left focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/20" onClick={onOpen} aria-label={`Open ${mealType} in diary`}>
      <span className={mealIconVariants({ meal: mealType })}><Apple className="w-5" aria-hidden="true" /></span>
      <span className="flex flex-col"><strong className="text-body">{mealType}</strong><Typography variant="caption">{mealEntries.length ? `${mealEntries.length} item${mealEntries.length === 1 ? '' : 's'}` : 'Nothing logged'}</Typography></span>
      <Typography variant="muted" className="font-bold">{Math.round(mealCalories)} cal</Typography>
    </button>
    <Button variant="ghost" size="icon" onClick={() => onQuickAdd(mealType)} aria-label={`Quick add to ${mealType}`}><Plus className="w-5" /></Button>
  </div>
}
