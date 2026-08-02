import { useState } from 'react'
import { goalFields } from '../../constants/goalFields'
import type { Goals } from '../../types'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { GoalField } from './GoalField'
import { GoalsIntroduction } from './GoalsIntroduction'
import { MyNetDiaryAccountCard } from './MyNetDiaryAccountCard'

export function GoalsView({ goals, onSave }: { goals: Goals; onSave: (goals: Goals) => void }) {
  const [draftGoals, setDraftGoals] = useState(goals)
  const updateDraftGoal = (goalKey: keyof Goals, value: number) => setDraftGoals(currentGoals => ({ ...currentGoals, [goalKey]: value }))

  return <>
    <GoalsIntroduction />
    <Card variant="flat" padding="none" className="px-card">{goalFields.map(goalField => <GoalField {...goalField} key={goalField.key} goalKey={goalField.key} value={draftGoals[goalField.key]} onChange={updateDraftGoal} />)}</Card>
    <Button fullWidth onClick={() => onSave(draftGoals)}>Save goals</Button>
    <MyNetDiaryAccountCard />
  </>
}
