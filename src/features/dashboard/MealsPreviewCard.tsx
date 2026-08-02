import type { DiaryEntry, MealType } from '../../types'
import { mealTypes } from '../../types'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { SectionHeader } from '../../components/ui/SectionHeader'
import { MealPreviewRow } from './MealPreviewRow'

type MealsPreviewCardProps = { entries: DiaryEntry[]; onQuickAdd: (mealType: MealType) => void; onViewDiary: () => void }

export function MealsPreviewCard({ entries, onQuickAdd, onViewDiary }: MealsPreviewCardProps) {
  return <Card className="pb-control">
    <SectionHeader eyebrow="Diary" title="Meals" action={<Button variant="ghost" size="compact" onClick={onViewDiary}>View all</Button>} />
    {mealTypes.map(mealType => <MealPreviewRow entries={entries} key={mealType} mealType={mealType} onQuickAdd={onQuickAdd} />)}
  </Card>
}
