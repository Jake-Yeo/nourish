import { useState } from 'react'
import { getTodayDateKey } from '../lib/dates/getTodayDateKey'
import type { NourishView } from '../types/navigation'

export function useNourishNavigation() {
  const [activeView, setActiveView] = useState<NourishView>('today')
  const [selectedDateKey, setSelectedDateKey] = useState(getTodayDateKey)
  const navigateToToday = () => { setSelectedDateKey(getTodayDateKey()); setActiveView('today') }

  return { activeView, navigateToToday, selectedDateKey, setActiveView, setSelectedDateKey }
}
