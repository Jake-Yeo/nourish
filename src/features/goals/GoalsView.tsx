import { useRef, useState } from 'react'
import { goalFields } from '../../constants/goalFields'
import { getMaintenanceAdjustmentThreshold } from '../../data'
import type { Goals } from '../../types'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { GoalField } from './GoalField'
import { GoalsIntroduction } from './GoalsIntroduction'
import { MyNetDiaryAccountCard } from './MyNetDiaryAccountCard'
import { PhotoStorageCard } from './PhotoStorageCard'

export function GoalsView({ goals, onSave }: { goals: Goals; onSave: (goals: Goals) => Promise<void> }) {
  const [draftGoals, setDraftGoals] = useState({ ...goals, maintenanceAdjustmentThreshold: getMaintenanceAdjustmentThreshold(goals) })
  const [isSaving, setIsSaving] = useState(false)
  const pending = useRef(false)
  const updateDraftGoal = (goalKey: keyof Goals, value: number) => setDraftGoals(currentGoals => ({ ...currentGoals, [goalKey]: value }))
  const save = async () => {
    if (pending.current) return
    pending.current = true; setIsSaving(true)
    try { await onSave(draftGoals) } finally { pending.current = false; setIsSaving(false) }
  }
  return <>
    <GoalsIntroduction />
    <fieldset disabled={isSaving} className="m-0 min-w-0 border-0 p-0"><Card variant="flat" padding="none" className="px-card">{goalFields.map(goalField => <GoalField {...goalField} key={goalField.key} goalKey={goalField.key} value={draftGoals[goalField.key]} onChange={updateDraftGoal} />)}</Card>
    <Button fullWidth loading={isSaving} onClick={() => void save()}>{isSaving ? 'Saving goals…' : 'Save goals'}</Button></fieldset>
    <PhotoStorageCard />
    <MyNetDiaryAccountCard />
  </>
}
