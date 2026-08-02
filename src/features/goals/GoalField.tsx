import type { Goals } from '../../types'
import { Input } from '../../components/ui/Input'
import { Typography } from '../../components/ui/Typography'

type GoalFieldProps = {
  description: string
  goalKey: keyof Goals
  label: string
  unit: string
  value: number
  onChange: (goalKey: keyof Goals, value: number) => void
}

export function GoalField({ description, goalKey, label, onChange, unit, value }: GoalFieldProps) {
  const numericalStep = goalKey === 'calories' || unit === 'mg' ? 1 : 0.1
  return <label className="flex items-center justify-between gap-control-wide border-b border-border py-content last:border-b-0">
    <span className="flex flex-col"><strong className="text-body">{label}</strong><Typography variant="caption">{description}</Typography></span>
    <span className="flex items-center rounded-field border border-border bg-canvas px-control-wide"><Input className="w-20 border-0 bg-transparent px-control py-control-wide text-right font-bold focus:ring-0" type="number" min="0" step={numericalStep} value={value} onChange={event => onChange(goalKey, Math.max(0, Number(event.target.value)))} /><Typography variant="caption">{unit}</Typography></span>
  </label>
}
