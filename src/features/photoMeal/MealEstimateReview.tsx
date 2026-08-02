import { Check } from 'lucide-react'
import type { MealType, Nutrients } from '../../types'
import type { MealEstimate } from '../../types/photoMeal'
import { Button } from '../../components/ui/Button'
import { SectionHeader } from '../../components/ui/SectionHeader'
import { Typography } from '../../components/ui/Typography'
import { EstimateItemCard } from './EstimateItemCard'
import { EstimateSummary } from './EstimateSummary'

type MealEstimateReviewProps = { estimate: MealEstimate; mealType: MealType; onFieldChange: (index: number, field: 'name' | 'portion', value: string) => void; onLog: (mealType: MealType) => void; onNutrientChange: (index: number, nutrient: keyof Nutrients, value: number) => void }

export function MealEstimateReview({ estimate, mealType, onFieldChange, onLog, onNutrientChange }: MealEstimateReviewProps) {
  return <div>
    <EstimateSummary estimate={estimate} />
    <SectionHeader eyebrow="Detected foods" title="Review before logging" action={<Typography variant="caption">{estimate.items.length} item{estimate.items.length === 1 ? '' : 's'}</Typography>} />
    <div className="grid gap-control">{estimate.items.map((item, itemIndex) => <EstimateItemCard item={item} itemIndex={itemIndex} key={`${item.name}-${itemIndex}`} onFieldChange={onFieldChange} onNutrientChange={onNutrientChange} />)}</div>
    {estimate.assumptions.length > 0 && <details className="my-control-wide rounded-control bg-canvas p-control-wide text-caption text-muted"><summary className="cursor-pointer font-bold text-ink">Assumptions behind this estimate</summary><ul className="mt-control list-disc pl-content leading-relaxed">{estimate.assumptions.map((assumption, index) => <li key={index}>{assumption}</li>)}</ul></details>}
    <Button fullWidth onClick={() => onLog(mealType)}><Check />Log estimated meal</Button>
  </div>
}
