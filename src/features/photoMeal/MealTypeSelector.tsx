import { mealTypes, type MealType } from '../../types'
import { cn } from '../../lib/cn'

export function MealTypeSelector({ selectedMealType, onSelect }: { selectedMealType: MealType; onSelect: (mealType: MealType) => void }) {
  return <div className="flex gap-control overflow-x-auto pb-control-wide [scrollbar-width:none]">
    {mealTypes.map(mealType => <button key={mealType} className={cn('min-w-20 flex-1 cursor-pointer rounded-field border px-control-wide py-control text-caption font-bold', selectedMealType === mealType ? 'border-primary bg-primary-soft text-primary-strong' : 'border-border bg-surface text-muted')} onClick={() => onSelect(mealType)}>{mealType}</button>)}
  </div>
}
