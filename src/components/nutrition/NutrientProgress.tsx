import { ProgressBar } from '../ui/ProgressBar'
import { roundNutrient } from '../../lib/nutrition/roundNutrient'

type NutrientProgressProps = { label: string; value: number; goal: number; unit: string; indicatorClassName: string }

export function NutrientProgress({ goal, indicatorClassName, label, unit, value }: NutrientProgressProps) {
  const completionPercentage = value / Math.max(goal, 1) * 100
  return <div>
    <div className="mb-control flex justify-between gap-control text-detail text-muted">
      <span className="font-bold text-ink">{label}</span>
      <span><b className="text-ink">{roundNutrient(value, 1)}</b> / {goal}{unit}</span>
    </div>
    <ProgressBar percentage={completionPercentage} indicatorClassName={indicatorClassName} />
  </div>
}
