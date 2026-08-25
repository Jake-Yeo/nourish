import { useRef, useState } from 'react'
import { Field } from '../../components/ui/Field'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { ModalHeader } from '../../components/ui/ModalHeader'
import { Button } from '../../components/ui/Button'
import { mealTypes, type MealType } from '../../types'
import { getTodayDateKey } from '../../lib/dates/getTodayDateKey'

type MoveDiaryModalProps = { count: number; initialDate: string; onClose: () => void; onMove: (date: string, meal: MealType) => Promise<void> }

export function MoveDiaryModal({ count, initialDate, onClose, onMove }: MoveDiaryModalProps) {
  const [date, setDate] = useState(initialDate || getTodayDateKey())
  const [meal, setMeal] = useState<MealType>('Breakfast')
  const [isMoving, setIsMoving] = useState(false)
  const movingRef = useRef(false)
  const close = () => { if (!movingRef.current) onClose() }
  const move = async () => {
    if (!date || movingRef.current) return
    movingRef.current = true
    setIsMoving(true)
    try { await onMove(date, meal) }
    finally { movingRef.current = false; setIsMoving(false) }
  }

  return <Modal accessibleLabel="Move diary entries" closeDisabled={isMoving} onClose={close}>
    <ModalHeader eyebrow="Diary" title={`Move ${count} item${count === 1 ? '' : 's'}`} closeDisabled={isMoving} onClose={close} />
    <div className="grid gap-content">
      <Field label="Date"><Input type="date" value={date} disabled={isMoving} onChange={event => setDate(event.target.value)} required /></Field>
      <Field label="Meal"><select value={meal} disabled={isMoving} onChange={event => setMeal(event.target.value as MealType)} className="w-full rounded-field border border-border bg-surface p-field text-base text-ink outline-none focus:border-primary focus:ring-3 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60">{mealTypes.map(mealType => <option key={mealType}>{mealType}</option>)}</select></Field>
      <Button disabled={!date} loading={isMoving} onClick={() => void move()}>{isMoving ? 'Moving…' : 'Move items'}</Button>
    </div>
  </Modal>
}
