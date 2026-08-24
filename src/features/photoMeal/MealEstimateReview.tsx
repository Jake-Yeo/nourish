import { useState } from 'react'
import { Check, Trash2 } from 'lucide-react'
import type { MealType, Nutrients } from '../../types'
import type { MealEstimate } from '../../types/photoMeal'
import { Button } from '../../components/ui/Button'
import { SectionHeader } from '../../components/ui/SectionHeader'
import { Typography } from '../../components/ui/Typography'
import { EstimateItemCard } from './EstimateItemCard'
import { EstimateSummary } from './EstimateSummary'
import { SourcesUsedCard } from './SourcesUsedCard'

type Props = { estimate: MealEstimate; mealType: MealType; actionLabel?: string; requireConfirmation?: boolean; onFieldChange: (index: number, field: 'name' | 'description' | 'portion', value: string) => void; onLog: (mealType: MealType) => void; onNutrientChange: (index: number, nutrient: keyof Nutrients, value: number) => void }

export function MealEstimateReview({ actionLabel = 'Log estimated meal', estimate, mealType, onFieldChange, onLog, onNutrientChange, requireConfirmation }: Props) {
  const [confirming, setConfirming] = useState(false)
  return <div>
    <EstimateSummary estimate={estimate} />
    <SectionHeader eyebrow="Detected foods" title="Review before logging" action={<Typography variant="caption">{estimate.items.length} item{estimate.items.length === 1 ? '' : 's'}</Typography>} />
    <div className="grid gap-control">{estimate.items.map((item, itemIndex) => <EstimateItemCard item={item} itemIndex={itemIndex} key={`${item.name}-${itemIndex}`} onFieldChange={onFieldChange} onNutrientChange={onNutrientChange} />)}</div>
    {estimate.assumptions.length > 0 && <details className="my-control-wide rounded-control bg-canvas p-control-wide text-caption text-muted"><summary className="cursor-pointer font-bold text-ink">Assumptions behind this estimate</summary><ul className="mt-control list-disc pl-content leading-relaxed">{estimate.assumptions.map((assumption, index) => <li key={index}>{assumption}</li>)}</ul></details>}
    <SourcesUsedCard disclosure={estimate.researchDisclosure} />
    {confirming ? <div className="grid gap-control rounded-control bg-destructive-soft p-control-wide"><p className="text-caption text-destructive">This replaces only the linked Nourish photo entries. Other diary entries are unchanged.</p><div className="flex gap-control"><Button variant="secondary" onClick={() => setConfirming(false)}>Cancel</Button><Button variant="destructive" onClick={() => onLog(mealType)}><Trash2 />Confirm replacement</Button></div></div> : <Button fullWidth onClick={() => requireConfirmation ? setConfirming(true) : onLog(mealType)}><Check />{actionLabel}</Button>}
  </div>
}
