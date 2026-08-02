import type { Nutrients } from '../../types'
import { Input } from '../../components/ui/Input'

type EditableNutrientsProps = { nutrients: Nutrients; onChange: (nutrientName: keyof Nutrients, value: number) => void }

export function EditableNutrients({ nutrients, onChange }: EditableNutrientsProps) {
  const editableNutrientNames: Array<keyof Nutrients> = ['calories', 'protein', 'carbs', 'fat', 'fiber']
  return <div className="col-span-full grid grid-cols-5 gap-control">
    {editableNutrientNames.map(nutrientName => <label className="grid gap-control text-center text-micro text-muted" key={nutrientName}><span>{nutrientName === 'calories' ? 'Cal' : nutrientName[0].toUpperCase()}</span><Input className="min-w-0 p-control text-center font-bold" type="number" min="0" value={Math.round(nutrients[nutrientName])} onChange={event => onChange(nutrientName, Number(event.target.value))} /></label>)}
  </div>
}
