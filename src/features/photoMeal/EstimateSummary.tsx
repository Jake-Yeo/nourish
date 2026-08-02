import { cva } from 'class-variance-authority'
import type { MealEstimate } from '../../types/photoMeal'
import { Badge } from '../../components/ui/Badge'
import { Typography } from '../../components/ui/Typography'

const confidenceBadgeVariants = cva('', { variants: { confidence: { high: 'bg-primary-soft text-primary', medium: 'bg-warning-soft text-warning', low: 'bg-destructive-soft text-destructive' } } })

export function EstimateSummary({ estimate }: { estimate: MealEstimate }) {
  return <>
    <div className="grid grid-cols-summary-value gap-control-wide rounded-sheet bg-canvas p-content"><div><Badge size="compact" className={confidenceBadgeVariants({ confidence: estimate.confidence })}>{estimate.confidence} confidence</Badge><Typography variant="muted" className="mt-control">{estimate.summary}</Typography></div><div className="flex flex-col items-end justify-center"><strong className="text-3xl tracking-tight">{Math.round(estimate.totals.calories)}</strong><Typography variant="caption">estimated cal</Typography></div></div>
    <div className="my-control-wide grid grid-cols-4 overflow-hidden rounded-control border border-border">{(['protein', 'carbs', 'fat', 'fiber'] as const).map(nutrientName => <div className="flex flex-col items-center border-r border-border p-control last:border-r-0" key={nutrientName}><strong className="text-body">{Math.round(estimate.totals[nutrientName])}g</strong><Typography variant="caption" className="capitalize">{nutrientName}</Typography></div>)}</div>
  </>
}
