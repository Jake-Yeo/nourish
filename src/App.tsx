import { useMemo } from 'react'
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

export default function App() {
  const { showToast, toastMessage } = useToast()
  const navigation = useNourishNavigation()
  const dialogs = useNourishDialogs()
  const { commitNutritionMutation, nutritionData } = useNourishData(showToast)
  const diaryMutations = useDiaryMutations({ commitNutritionMutation, selectedDateKey: navigation.selectedDateKey, showToast, closePhotoMeal: dialogs.closePhotoMeal, closeQuickAdd: dialogs.closeQuickAdd })
  const myNetDiarySync = useMyNetDiarySync(commitNutritionMutation, showToast)
  const selectedDateEntries = useMemo(() => nutritionData.entries.filter(entry => entry.date === navigation.selectedDateKey), [navigation.selectedDateKey, nutritionData.entries])
  const saveNutritionGoals = async (goals: typeof nutritionData.goals) => {
    if (await commitNutritionMutation({ type: 'updateGoals', goals })) showToast('Nutrition goals saved')
  }

  return <div className="grid h-dvh min-w-80 overflow-hidden bg-canvas font-sans text-ink antialiased desktop:grid-cols-app-shell">
    <DesktopSidebar activeView={navigation.activeView} onViewChange={navigation.setActiveView} />
    <main className="mx-auto h-dvh w-full max-w-app touch-pan-y overflow-x-hidden overflow-y-auto overscroll-y-auto px-page-mobile pt-page-top-mobile pb-page-bottom-mobile [-webkit-overflow-scrolling:touch] desktop:px-page-desktop desktop:pt-page-top-desktop desktop:pb-page-bottom-desktop">
      <AppHeader activeView={navigation.activeView} isSyncing={myNetDiarySync.isSyncing} onGoalsOpen={() => navigation.setActiveView('goals')} onSync={myNetDiarySync.synchronizeMyNetDiary} onTodayOpen={navigation.navigateToToday} />
      {navigation.activeView !== 'goals' && <DateNavigator dateKey={navigation.selectedDateKey} onDateChange={navigation.setSelectedDateKey} />}
      <AppViewContent activeView={navigation.activeView} dateEntries={selectedDateEntries} nutritionData={nutritionData} selectedDateKey={navigation.selectedDateKey} onDeleteEntry={diaryMutations.deleteDiaryEntry} onEntrySelect={dialogs.openEntryDetails} onGoalsSave={saveNutritionGoals} onPhotoMeal={dialogs.openPhotoMeal} onQuickAdd={dialogs.openQuickAdd} onViewDiary={() => navigation.setActiveView('diary')} />
    </main>
    <MobileNavigation activeView={navigation.activeView} onViewChange={navigation.setActiveView} />
    {dialogs.quickAddMeal && <QuickAddModal mealType={dialogs.quickAddMeal} onClose={dialogs.closeQuickAdd} onLog={diaryMutations.addQuickEntry} />}
    {dialogs.photoMealType && <PhotoMealModal defaultMealType={dialogs.photoMealType} onClose={dialogs.closePhotoMeal} onLog={diaryMutations.addPhotoEntries} />}
    {dialogs.selectedDiaryEntry && <EntryDetailModal diaryEntry={dialogs.selectedDiaryEntry} onClose={dialogs.closeEntryDetails} />}
    <NourishToast message={toastMessage} />
  </div>
}
