import { useMemo, useState } from 'react'
import { AppHeader } from './components/layout/AppHeader'
import { AppViewContent } from './components/layout/AppViewContent'
import { DateNavigator } from './components/layout/DateNavigator'
import { DesktopSidebar } from './components/layout/DesktopSidebar'
import { MobileNavigation } from './components/layout/MobileNavigation'
import { NourishToast } from './components/layout/NourishToast'
import { EntryDetailModal } from './features/diary/EntryDetailModal'
import { PhotoMealModal } from './features/photoMeal/PhotoMealModal'
import { QuickAddModal } from './features/quickAdd/QuickAddModal'
import { useDiaryMutations } from './hooks/useDiaryMutations'
import { useMyNetDiarySync } from './hooks/useMyNetDiarySync'
import { useNourishData } from './hooks/useNourishData'
import { useNourishDialogs } from './hooks/useNourishDialogs'
import { useNourishNavigation } from './hooks/useNourishNavigation'
import { useToast } from './hooks/useToast'
import type { DiaryEntry, Food } from './types'
import type { MealAnalysisJob, MealEstimate } from './types/photoMeal'

async function replaceAnalyzedItem(job: MealAnalysisJob, estimate: MealEstimate) {
  const replacement = job.source.replacement
  if (!replacement || estimate.items.length !== 1) return false
  const item = estimate.items[0]
  const food: Food = { id: `photo-${crypto.randomUUID()}`, name: item.name, brand: `AI estimate · ${estimate.confidence} confidence`, servingLabel: item.portion, servingGrams: 0, nutrients: item.nutrients, source: 'custom' }
  const entry: DiaryEntry = { id: crypto.randomUUID(), date: job.source.date, meal: job.source.mealType, food, servings: 1, loggedAt: Date.now(), source: 'nourish-photo', aiPhotoExplanation: { confidence: estimate.confidence, summary: estimate.summary, assumptions: estimate.assumptions, calorieBreakdown: estimate.calorieBreakdown } }
  const response = await fetch(`/api/photo-meals/${replacement.mealId}/items/${replacement.itemId}/entry`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ entries: [entry], items: [{ ...job.source.items[0], id: replacement.itemId, entryId: entry.id }], mealNote: job.source.note, analysisJobId: job.id }) })
  if (response.ok) window.location.reload()
  return response.ok
}

export default function App() {
  const { showToast, toastMessage } = useToast()
  const navigation = useNourishNavigation()
  const dialogs = useNourishDialogs()
  const { commitNutritionMutation, commitPhotoMeal, commitLoggedPhotoMeal, nutritionData } = useNourishData(showToast)
  const diaryMutations = useDiaryMutations({ commitNutritionMutation, commitPhotoMeal, commitLoggedPhotoMeal, selectedDateKey: navigation.selectedDateKey, showToast, closePhotoMeal: dialogs.closePhotoMeal, closeQuickAdd: dialogs.closeQuickAdd })
  const myNetDiarySync = useMyNetDiarySync(showToast)
  const [queuedAnalysisJob, setQueuedAnalysisJob] = useState<MealAnalysisJob | null>(null)
  const selectedDateEntries = useMemo(() => nutritionData.entries.filter(entry => entry.date === navigation.selectedDateKey), [navigation.selectedDateKey, nutritionData.entries])
  const saveNutritionGoals = async (goals: typeof nutritionData.goals) => {
    if (await commitNutritionMutation({ type: 'updateGoals', goals })) showToast('Nutrition goals saved')
  }
  const saveWeightChangeStartDate = (startDate: string) => commitNutritionMutation({ type: 'updateWeightChangeStartDate', startDate })
  const logAnalysis = (job: MealAnalysisJob, estimate: MealEstimate) => {
    const foods = estimate.items.map(item => ({ id: `photo-${crypto.randomUUID()}`, name: item.name, brand: `AI estimate · ${estimate.confidence} confidence`, servingLabel: item.portion, servingGrams: 0, nutrients: item.nutrients, source: 'custom' as const }))
    const explanation = { confidence: estimate.confidence, summary: estimate.summary, assumptions: estimate.assumptions, calorieBreakdown: estimate.calorieBreakdown }
    if (job.loggedAt) return diaryMutations.updateLoggedPhotoEntries(job.id, foods, job.source.items, job.source.mealType, explanation, job.source.note, job.source.date)
    return job.source.replacement ? replaceAnalyzedItem(job, estimate) : diaryMutations.addPhotoEntries(foods, job.source.items, job.source.mealType, explanation, job.source.note, job.source.date, job.id)
  }
  const openAnalysisDiary = (job: MealAnalysisJob) => { navigation.setSelectedDateKey(job.source.date); navigation.navigateToDiary(job.source.mealType) }

  return <div className="grid h-dvh min-w-80 overflow-hidden bg-canvas font-sans text-ink antialiased desktop:grid-cols-app-shell">
    <DesktopSidebar activeView={navigation.activeView} onViewChange={navigation.setActiveView} />
    <main className="mx-auto h-dvh w-full max-w-app touch-pan-y overflow-x-hidden overflow-y-auto overscroll-y-auto px-page-mobile pt-page-top-mobile pb-page-bottom-mobile [-webkit-overflow-scrolling:touch] desktop:px-page-desktop desktop:pt-page-top-desktop desktop:pb-page-bottom-desktop">
      <AppHeader activeView={navigation.activeView} isSyncing={myNetDiarySync.isSyncing} syncStatus={myNetDiarySync.status} onGoalsOpen={() => navigation.setActiveView('goals')} onSync={myNetDiarySync.synchronizeMyNetDiary} onTodayOpen={navigation.navigateToToday} />
      {navigation.activeView !== 'goals' && <DateNavigator dateKey={navigation.selectedDateKey} onDateChange={navigation.setSelectedDateKey} />}
      <AppViewContent activeView={navigation.activeView} dateEntries={selectedDateEntries} diaryMealTarget={navigation.diaryMealTarget} nutritionData={nutritionData} selectedDateKey={navigation.selectedDateKey} queuedAnalysisJob={queuedAnalysisJob} onAnalysisLog={logAnalysis} onAnalysisOpenDiary={openAnalysisDiary} onAnalysisRerun={dialogs.openPhotoMealRerun} onOpenAnalysis={() => navigation.setActiveView('analysis')} onDeleteEntry={diaryMutations.deleteDiaryEntry} onDiaryMealTargetConsumed={navigation.clearDiaryMealTarget} onEntryMove={diaryMutations.moveDiaryEntries} onEntrySelect={dialogs.openEntryDetails} onGoalsSave={saveNutritionGoals} onWeightChangeStartDateChange={saveWeightChangeStartDate} onPhotoMeal={dialogs.openPhotoMeal} onQuickAdd={dialogs.openQuickAdd} onViewDiary={navigation.navigateToDiary} />
    </main>
    <MobileNavigation activeView={navigation.activeView} onViewChange={navigation.setActiveView} />
    {dialogs.quickAddMeal && <QuickAddModal mealType={dialogs.quickAddMeal} onClose={dialogs.closeQuickAdd} onLog={diaryMutations.addQuickEntry} />}
    {dialogs.photoMealType && <PhotoMealModal defaultMealType={dialogs.photoMealType} initialJob={dialogs.photoMealSeed ?? undefined} selectedDateKey={navigation.selectedDateKey} onClose={dialogs.closePhotoMeal} onQueued={job => { setQueuedAnalysisJob(job); showToast('Meal analysis queued'); navigation.setActiveView('analysis') }} />}
    {dialogs.selectedDiaryEntry && <EntryDetailModal diaryEntry={dialogs.selectedDiaryEntry} onClose={dialogs.closeEntryDetails} />}
    <NourishToast message={toastMessage} />
  </div>
}
