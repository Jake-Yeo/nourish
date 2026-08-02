import { Sparkles } from 'lucide-react'
import type { Goals, Nutrients } from '../../types'
import { roundNutrient } from '../../lib/nutrition/roundNutrient'
import { Card } from '../../components/ui/Card'
import { Typography } from '../../components/ui/Typography'

export function FiberTipCard({ goals, nutrients }: { goals: Goals; nutrients: Nutrients }) {
  const fiberMessage = nutrients.fiber >= goals.fiber ? 'Fiber goal reached.' : `${roundNutrient(goals.fiber - nutrients.fiber, 1)}g fiber to go.`
  return <Card variant="soft" className="flex gap-control-wide">
    <div className="grid size-icon-small shrink-0 place-items-center rounded-icon bg-surface text-primary"><Sparkles /></div>
    <Typography className="text-muted"><strong className="text-ink">{fiberMessage}</strong><br />Try berries, beans, avocado, or whole grains to close the gap.</Typography>
  </Card>
}
