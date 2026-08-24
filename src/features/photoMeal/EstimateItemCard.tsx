import type { Nutrients } from '../../types'
import type { MealEstimateItem } from '../../types/photoMeal'
import { Field } from '../../components/ui/Field'
import { Input } from '../../components/ui/Input'
import { TextArea } from '../../components/ui/TextArea'
import { EditableNutrients } from './EditableNutrients'

type Props = { item: MealEstimateItem; itemIndex: number; onFieldChange: (index: number, field: 'name' | 'description' | 'portion', value: string) => void; onNutrientChange: (index: number, nutrient: keyof Nutrients, value: number) => void }

export function EstimateItemCard({ item, itemIndex, onFieldChange, onNutrientChange }: Props) {
  return <section className="grid grid-cols-estimate-item gap-control rounded-control border border-border p-control-wide">
    <div className="grid size-7 place-items-center rounded-field bg-primary-soft text-caption font-extrabold text-primary">{itemIndex + 1}</div>
    <div className="grid gap-control"><Field label="Name"><Input className="font-bold" value={item.name} onChange={event => onFieldChange(itemIndex, 'name', event.target.value)} /></Field><Field label="Description"><TextArea value={item.description} onChange={event => onFieldChange(itemIndex, 'description', event.target.value)} /></Field><Field label="Serving"><Input className="text-muted" value={item.portion} onChange={event => onFieldChange(itemIndex, 'portion', event.target.value)} /></Field></div>
    <EditableNutrients nutrients={item.nutrients} onChange={(name, value) => onNutrientChange(itemIndex, name, value)} />
  </section>
}
