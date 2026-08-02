import { Plus } from 'lucide-react'
import type { Food, MealType } from '../../types'
import { useQuickAddForm } from '../../hooks/useQuickAddForm'
import { Button } from '../../components/ui/Button'
import { Field } from '../../components/ui/Field'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { ModalHeader } from '../../components/ui/ModalHeader'
import { Stack } from '../../components/ui/Stack'
import { QuickAddNutritionFields } from './QuickAddNutritionFields'

export function QuickAddModal({ mealType, onClose, onLog }: { mealType: MealType; onClose: () => void; onLog: (food: Food, mealType: MealType) => void }) {
  const form = useQuickAddForm(mealType, onLog)
  return <Modal accessibleLabel="Quick add nutrition" onClose={onClose}>
    <ModalHeader eyebrow={`Add to ${mealType}`} title="Quick add" onClose={onClose} />
    <Stack gap="controlWide">
      <Field label="Name" optional><Input value={form.quickAddValues.name} onChange={event => form.updateQuickAddValue('name', event.target.value)} placeholder="e.g. Restaurant meal adjustment" /></Field>
      <QuickAddNutritionFields values={form.quickAddValues} onChange={form.updateQuickAddValue} />
      <Button fullWidth onClick={form.submitQuickAdd}><Plus />Add to {mealType}</Button>
      {form.validationMessage && <p className="rounded-field bg-destructive-soft p-control-wide text-detail text-destructive">{form.validationMessage}</p>}
    </Stack>
  </Modal>
}
