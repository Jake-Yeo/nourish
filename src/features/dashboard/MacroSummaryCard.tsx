import type { DiaryEntry, Goals } from '../../types'
import { primaryNutrients } from '../../constants/nutrients'
import { getTotalNutrients } from '../../lib/nutrition/getTotalNutrients'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { NutrientProgress } from '../../components/nutrition/NutrientProgress'
import { SectionHeader } from '../../components/ui/SectionHeader'

export function MacroSummaryCard({ entries, goals, onViewDiary }: { entries: DiaryEntry[]; goals: Goals; onViewDiary: () => void }) {
  const totalNutrients = getTotalNutrients(entries)
  return <Card>
    <SectionHeader eyebrow="Nutrition" title="Your macros" action={<Button variant="ghost" size="compact" onClick={onViewDiary}>Details</Button>} />
    <div className="grid grid-cols-1 gap-section compact:grid-cols-2">
      {primaryNutrients.map(nutrient => <NutrientProgress key={nutrient.key} label={nutrient.label} unit={nutrient.unit} indicatorClassName={nutrient.indicatorClassName} value={totalNutrients[nutrient.key]} goal={goals[nutrient.key]} />)}
    </div>
  </Card>
}
