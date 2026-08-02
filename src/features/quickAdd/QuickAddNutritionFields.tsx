import { Field } from '../../components/ui/Field'
import { Input } from '../../components/ui/Input'

type NutritionFieldName = 'calories' | 'protein' | 'fiber'
type QuickAddNutritionFieldsProps = { values: Record<NutritionFieldName, string>; onChange: (fieldName: NutritionFieldName, value: string) => void }

export function QuickAddNutritionFields({ onChange, values }: QuickAddNutritionFieldsProps) {
  const nutritionFieldNames: NutritionFieldName[] = ['calories', 'protein', 'fiber']
  return <div className="grid grid-cols-1 gap-control-wide compact:grid-cols-3">
    {nutritionFieldNames.map(fieldName => <Field key={fieldName} label={fieldName[0].toUpperCase() + fieldName.slice(1)} optional><Input type="number" inputMode="decimal" min="0" value={values[fieldName]} onChange={event => onChange(fieldName, event.target.value)} /></Field>)}
  </div>
}
