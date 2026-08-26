import type { CalorieBreakdown } from '../../types'
import { Card } from '../../components/ui/Card'
import { Typography } from '../../components/ui/Typography'

export function CalorieReasoningCard({ breakdown }: { breakdown: CalorieBreakdown }) {
  return <Card variant="soft" className="my-control-wide grid gap-control p-control-wide">
    <Typography variant="eyebrow">Why this calorie estimate</Typography>
    <Typography variant="muted">{breakdown.explanation}</Typography>
    <ul className="grid gap-control text-caption text-muted">{breakdown.components.map((component, index) => <li className="rounded-control bg-surface p-control" key={`${component.name}-${index}`}><span className="font-bold text-ink">{component.name}: {Math.round(component.calories)} cal</span><span className="block">{component.portion} · {component.evidence}</span></li>)}</ul>
  </Card>
}
