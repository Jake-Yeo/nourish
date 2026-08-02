import { additionalNutrients, primaryNutrients } from '../../constants/nutrients'
import type { Goals, Nutrients } from '../../types'
import { Card } from '../../components/ui/Card'
import { NutrientProgress } from '../../components/nutrition/NutrientProgress'
import { SectionHeader } from '../../components/ui/SectionHeader'
import { getNutrientIndicatorClassName } from '../../lib/nutrition/getNutrientIndicatorClassName'

export function NutrientReportCard({ goals, nutrients }: { goals: Goals; nutrients: Nutrients }) {
  return <Card>
    <SectionHeader eyebrow="Today" title="Nutrient report" />
    <div className="grid gap-section">{[...primaryNutrients, ...additionalNutrients].map(nutrient => <NutrientProgress key={nutrient.key} label={nutrient.label} unit={nutrient.unit} indicatorClassName={getNutrientIndicatorClassName(nutrient.key)} value={nutrients[nutrient.key]} goal={goals[nutrient.key]} />)}</div>
  </Card>
}
