import type { Nutrients } from '../../types'
import type { MealEstimateItem } from '../../types/photoMeal'
import { Input } from '../../components/ui/Input'
import { EditableNutrients } from './EditableNutrients'

type EstimateItemCardProps = { item: MealEstimateItem; itemIndex: number; onFieldChange: (index: number, field: 'name' | 'portion', value: string) => void; onNutrientChange: (index: number, nutrient: keyof Nutrients, value: number) => void }

export function EstimateItemCard({ item, itemIndex, onFieldChange, onNutrientChange }: EstimateItemCardProps) {
  return <section className="grid grid-cols-estimate-item gap-control rounded-control border border-border p-control-wide">
    <div className="grid size-7 place-items-center rounded-field bg-primary-soft text-caption font-extrabold text-primary">{itemIndex + 1}</div>
    <div className="grid grid-cols-1 gap-control compact:grid-cols-2"><Input className="font-bold" value={item.name} onChange={event => onFieldChange(itemIndex, 'name', event.target.value)} /><Input className="text-muted" value={item.portion} onChange={event => onFieldChange(itemIndex, 'portion', event.target.value)} /></div>
    <EditableNutrients nutrients={item.nutrients} onChange={(nutrientName, value) => onNutrientChange(itemIndex, nutrientName, value)} />
  </section>
}
