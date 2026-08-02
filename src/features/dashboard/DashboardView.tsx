import type { DiaryEntry, Goals, MealType } from '../../types'
import { DailySummaryCard } from './DailySummaryCard'
import { MacroSummaryCard } from './MacroSummaryCard'
import { MealsPreviewCard } from './MealsPreviewCard'

type DashboardViewProps = {
  entries: DiaryEntry[]
  goals: Goals
  onPhotoMeal: () => void
  onQuickAdd: (mealType?: MealType) => void
  onViewDiary: () => void
}

export function DashboardView({ entries, goals, onPhotoMeal, onQuickAdd, onViewDiary }: DashboardViewProps) {
  return <>
    <DailySummaryCard entries={entries} goals={goals} onPhotoMeal={onPhotoMeal} onQuickAdd={onQuickAdd} />
    <MacroSummaryCard entries={entries} goals={goals} onViewDiary={onViewDiary} />
    <MealsPreviewCard entries={entries} onQuickAdd={onQuickAdd} onViewDiary={onViewDiary} />
  </>
}
