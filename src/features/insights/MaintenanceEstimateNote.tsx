import { Badge } from '../../components/ui/Badge'

export function MaintenanceEstimateNote({ actualCalories, assumedCalories, usesCurrentDayGoal = false }: { actualCalories: number; assumedCalories: number; usesCurrentDayGoal?: boolean }) {
  const label = usesCurrentDayGoal ? 'Current day' : `Actual ${Math.round(actualCalories).toLocaleString()} cal shown`
  const assumption = usesCurrentDayGoal ? 'goal' : 'maintenance'
  return <Badge className="mt-badge max-w-48 whitespace-normal text-right normal-case tracking-normal" size="compact" variant="warning">
    {label} · Average uses {assumedCalories.toLocaleString()} {assumption} cal
  </Badge>
}
