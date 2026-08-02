import { mealTypes, type MealType } from '../../types'
import { cn } from '../../lib/cn'

export function MealTypeSelector({ selectedMealType, onSelect }: { selectedMealType: MealType; onSelect: (mealType: MealType) => void }) {
  return <div className="grid grid-cols-4 gap-control pb-control-wide">
    {mealTypes.map(mealType => <button type="button" key={mealType} className={cn('min-h-12 min-w-0 cursor-pointer overflow-hidden rounded-field border px-badge py-control-wide text-micro font-bold transition-all duration-150 ease-out hover:brightness-95 active:scale-95 active:brightness-90', selectedMealType === mealType ? 'border-primary bg-primary-soft text-primary-strong' : 'border-border bg-surface text-muted')} onClick={() => onSelect(mealType)}>{mealType}</button>)}
  </div>
}
