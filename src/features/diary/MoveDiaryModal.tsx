import { Field } from '../../components/ui/Field'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { ModalHeader } from '../../components/ui/ModalHeader'
import { Button } from '../../components/ui/Button'
import { mealTypes, type MealType } from '../../types'
import { getTodayDateKey } from '../../lib/dates/getTodayDateKey'
import { useState } from 'react'

type MoveDiaryModalProps = { count: number; initialDate: string; onClose: () => void; onMove: (date: string, meal: MealType) => void }

export function MoveDiaryModal({ count, initialDate, onClose, onMove }: MoveDiaryModalProps) {
  const [date, setDate] = useState(initialDate || getTodayDateKey())
  const [meal, setMeal] = useState<MealType>('Breakfast')
  return <Modal accessibleLabel="Move diary entries" onClose={onClose}>
    <ModalHeader eyebrow="Diary" title={`Move ${count} item${count === 1 ? '' : 's'}`} onClose={onClose} />
    <div className="grid gap-content">
      <Field label="Date"><Input type="date" value={date} onChange={event => setDate(event.target.value)} required /></Field>
      <Field label="Meal"><select value={meal} onChange={event => setMeal(event.target.value as MealType)} className="w-full rounded-field border border-border bg-surface p-field text-base text-ink outline-none focus:border-primary focus:ring-3 focus:ring-primary/15">{mealTypes.map(mealType => <option key={mealType}>{mealType}</option>)}</select></Field>
      <Button disabled={!date} onClick={() => onMove(date, meal)}>Move items</Button>
    </div>
  </Modal>
}
