import type { AppData, DiaryEntry, Goals, MealType } from '../../types'
import type { NourishView } from '../../types/navigation'
import { DashboardView } from '../../features/dashboard/DashboardView'
import { DiaryView } from '../../features/diary/DiaryView'
import { GoalsView } from '../../features/goals/GoalsView'
import { InsightsView } from '../../features/insights/InsightsView'
import { AnalysisView } from '../../features/analysis/AnalysisView'
import type { MealAnalysisJob, MealEstimate } from '../../types/photoMeal'

type AppViewContentProps = { activeView: NourishView; dateEntries: DiaryEntry[]; diaryMealTarget: MealType | null; nutritionData: AppData; selectedDateKey: string; queuedAnalysisJob?: MealAnalysisJob | null; onAnalysisLog: (job: MealAnalysisJob, estimate: MealEstimate) => Promise<boolean>; onAnalysisOpenDiary: (job: MealAnalysisJob) => void; onAnalysisRerun: (job: MealAnalysisJob) => void; onOpenAnalysis: () => void; onDeleteEntry: (id: string) => void; onDiaryMealTargetConsumed: () => void; onEntryMove: (ids: string[], date: string, meal: MealType) => Promise<boolean>; onEntrySelect: (entry: DiaryEntry) => void; onGoalsSave: (goals: Goals) => void; onWeightChangeStartDateChange: (startDate: string) => Promise<boolean>; onPhotoMeal: () => void; onQuickAdd: (mealType?: MealType) => void; onViewDiary: (mealType?: MealType) => void }

export function AppViewContent(props: AppViewContentProps) {
  return <div className="grid gap-content">
    {props.activeView === 'today' && <DashboardView entries={props.dateEntries} allEntries={props.nutritionData.entries} weightChangeStartDate={props.nutritionData.weightChangeStartDate} goals={props.nutritionData.goals} selectedDateKey={props.selectedDateKey} onOpenAnalysis={props.onOpenAnalysis} onPhotoMeal={props.onPhotoMeal} onQuickAdd={props.onQuickAdd} onViewDiary={props.onViewDiary} />}
    {props.activeView === 'diary' && <DiaryView entries={props.dateEntries} focusMeal={props.diaryMealTarget} selectedDateKey={props.selectedDateKey} onAdd={props.onQuickAdd} onDelete={props.onDeleteEntry} onFocusMealConsumed={props.onDiaryMealTargetConsumed} onMove={props.onEntryMove} onSelect={props.onEntrySelect} />}
    {props.activeView === 'analysis' && <AnalysisView selectedDateKey={props.selectedDateKey} queuedJob={props.queuedAnalysisJob} onLog={props.onAnalysisLog} onOpenDiary={props.onAnalysisOpenDiary} onRerun={props.onAnalysisRerun} />}
    {props.activeView === 'insights' && <InsightsView endingDateKey={props.selectedDateKey} nutritionData={props.nutritionData} onWeightChangeStartDateChange={props.onWeightChangeStartDateChange} />}
    {props.activeView === 'goals' && <GoalsView goals={props.nutritionData.goals} onSave={props.onGoalsSave} />}
  </div>
}
