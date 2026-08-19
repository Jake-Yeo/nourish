import type { DiaryEntry, Goals, MealType } from '../../types'
import { DailySummaryCard } from './DailySummaryCard'
import { DailyWeightEstimateCard } from './DailyWeightEstimateCard'
import { MacroSummaryCard } from './MacroSummaryCard'
import { MealsPreviewCard } from './MealsPreviewCard'

type DashboardViewProps = {
  entries: DiaryEntry[]
  allEntries: DiaryEntry[]
  weightChangeStartDate?: string
  selectedDateKey: string
  goals: Goals
  onPhotoMeal: () => void
  onOpenAnalysis: () => void
  onQuickAdd: (mealType?: MealType) => void
  onViewDiary: (mealType?: MealType) => void
}

export function DashboardView({ entries, allEntries, weightChangeStartDate, goals, onOpenAnalysis, onPhotoMeal, onQuickAdd, onViewDiary, selectedDateKey }: DashboardViewProps) {
  return <>
    <DailySummaryCard entries={entries} goals={goals} onOpenAnalysis={onOpenAnalysis} onPhotoMeal={onPhotoMeal} onQuickAdd={onQuickAdd} />
    <MacroSummaryCard entries={entries} goals={goals} onViewDiary={onViewDiary} />
    <DailyWeightEstimateCard dateKey={selectedDateKey} entries={entries} allEntries={allEntries} goals={goals} weightChangeStartDate={weightChangeStartDate} />
    <MealsPreviewCard entries={entries} onQuickAdd={onQuickAdd} onViewDiary={onViewDiary} />
  </>
}
