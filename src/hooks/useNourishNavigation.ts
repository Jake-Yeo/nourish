import { useState } from 'react'
import { getTodayDateKey } from '../lib/dates/getTodayDateKey'
import type { NourishView } from '../types/navigation'
import type { MealType } from '../types'

export function useNourishNavigation() {
  const [activeView, setActiveView] = useState<NourishView>('today')
  const [selectedDateKey, setSelectedDateKey] = useState(getTodayDateKey)
  const [diaryMealTarget, setDiaryMealTarget] = useState<MealType | null>(null)
  const changeView = (view: NourishView) => { setDiaryMealTarget(null); setActiveView(view) }
  const changeDate = (dateKey: string) => { setDiaryMealTarget(null); setSelectedDateKey(dateKey) }
  const navigateToToday = () => { setDiaryMealTarget(null); setSelectedDateKey(getTodayDateKey()); setActiveView('today') }
  const navigateToDiary = (mealType?: MealType) => { setDiaryMealTarget(mealType ?? null); setActiveView('diary') }

  return { activeView, clearDiaryMealTarget: () => setDiaryMealTarget(null), diaryMealTarget, navigateToDiary, navigateToToday, selectedDateKey, setActiveView: changeView, setSelectedDateKey: changeDate }
}
