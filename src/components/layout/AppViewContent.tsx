import type { AppData, DiaryEntry, Goals, MealType } from '../../types'
import type { NourishView } from '../../types/navigation'
import { DashboardView } from '../../features/dashboard/DashboardView'
import { DiaryView } from '../../features/diary/DiaryView'
import { GoalsView } from '../../features/goals/GoalsView'
import { InsightsView } from '../../features/insights/InsightsView'

type AppViewContentProps = { activeView: NourishView; dateEntries: DiaryEntry[]; nutritionData: AppData; selectedDateKey: string; onDeleteEntry: (id: string) => void; onEntrySelect: (entry: DiaryEntry) => void; onGoalsSave: (goals: Goals) => void; onPhotoMeal: () => void; onQuickAdd: (mealType?: MealType) => void; onViewDiary: () => void }

export function AppViewContent(props: AppViewContentProps) {
  return <div className="grid gap-content">
    {props.activeView === 'today' && <DashboardView entries={props.dateEntries} goals={props.nutritionData.goals} onPhotoMeal={props.onPhotoMeal} onQuickAdd={props.onQuickAdd} onViewDiary={props.onViewDiary} />}
    {props.activeView === 'diary' && <DiaryView entries={props.dateEntries} onAdd={props.onQuickAdd} onDelete={props.onDeleteEntry} onSelect={props.onEntrySelect} />}
    {props.activeView === 'insights' && <InsightsView endingDateKey={props.selectedDateKey} nutritionData={props.nutritionData} />}
    {props.activeView === 'goals' && <GoalsView goals={props.nutritionData.goals} onSave={props.onGoalsSave} />}
  </div>
}
