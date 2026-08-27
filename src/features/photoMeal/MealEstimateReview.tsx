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
import { CalorieReasoningCard } from './CalorieReasoningCard'

type Props = { estimate: MealEstimate; mealType: MealType; actionLabel?: string; reviewTitle?: string; requireConfirmation?: boolean; isLogging?: boolean; onDelete?: () => void; isDeleting?: boolean; onFieldChange: (index: number, field: 'name' | 'description' | 'portion', value: string) => void; onLog: (mealType: MealType) => void; onNutrientChange: (index: number, nutrient: keyof Nutrients, value: number) => void }

export function MealEstimateReview({ actionLabel = 'Log estimated meal', estimate, mealType, onFieldChange, onLog, onNutrientChange, requireConfirmation, reviewTitle = 'Review before logging', isLogging = false, onDelete, isDeleting = false }: Props) {
  const [confirming, setConfirming] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  return <div>
    <EstimateSummary estimate={estimate} />
    {estimate.calorieBreakdown && <CalorieReasoningCard breakdown={estimate.calorieBreakdown} />}
    <SectionHeader eyebrow="Detected foods" title={reviewTitle} action={<Typography variant="caption">{estimate.items.length} item{estimate.items.length === 1 ? '' : 's'}</Typography>} />
    <div className="grid gap-control">{estimate.items.map((item, itemIndex) => <EstimateItemCard item={item} itemIndex={itemIndex} key={`${item.name}-${itemIndex}`} onFieldChange={onFieldChange} onNutrientChange={onNutrientChange} />)}</div>
    {estimate.assumptions.length > 0 && <details className="my-control-wide rounded-control bg-canvas p-control-wide text-caption text-muted"><summary className="cursor-pointer font-bold text-ink">Assumptions behind this estimate</summary><ul className="mt-control list-disc pl-content leading-relaxed">{estimate.assumptions.map((assumption, index) => <li key={index}>{assumption}</li>)}</ul></details>}
    <SourcesUsedCard disclosure={estimate.researchDisclosure} />
    {confirmingDelete && onDelete ? <div className="grid gap-control rounded-control bg-destructive-soft p-control-wide"><p className="text-caption text-destructive">Delete this analysis and its stored photos? Any Diary meal you already logged stays unchanged.</p><div className="grid grid-cols-2 gap-control"><Button variant="secondary" disabled={isDeleting} onClick={() => setConfirmingDelete(false)}>Keep analysis</Button><Button variant="destructive" className="rounded-control border border-destructive/30 bg-surface" loading={isDeleting} onClick={onDelete}><Trash2 />{isDeleting ? 'Deleting…' : 'Delete permanently'}</Button></div></div> : confirming ? <div className="grid gap-control rounded-control bg-warning-soft p-control-wide"><p className="text-caption text-warning">This updates only the linked Nourish photo entries. Other Diary entries are unchanged.</p><div className="flex gap-control"><Button variant="secondary" disabled={isLogging} onClick={() => setConfirming(false)}>Cancel</Button><Button loading={isLogging} onClick={() => onLog(mealType)}><Check />{isLogging ? 'Updating…' : 'Confirm update'}</Button></div></div> : requireConfirmation ? <Button fullWidth loading={isLogging} onClick={() => setConfirming(true)}><Check />{isLogging ? 'Updating…' : actionLabel}</Button> : <div className={onDelete ? 'grid grid-cols-2 gap-control' : ''}><Button fullWidth loading={isLogging} disabled={isDeleting} onClick={() => onLog(mealType)}><Check />{isLogging ? 'Logging…' : actionLabel}</Button>{onDelete && <Button variant="destructive" fullWidth className="rounded-control border border-destructive/30 bg-surface hover:bg-destructive-soft" disabled={isLogging} onClick={() => setConfirmingDelete(true)}><Trash2 />Delete analysis</Button>}</div>}
  </div>
}
