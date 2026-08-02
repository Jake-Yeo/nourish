import { Apple, BarChart3, Home, Target } from 'lucide-react'
import type { NourishView } from '../types/navigation'

export const navigationItems: Array<{ id: NourishView; label: string; icon: typeof Home }> = [
  { id: 'today', label: 'Today', icon: Home }, { id: 'diary', label: 'Diary', icon: Apple },
  { id: 'insights', label: 'Insights', icon: BarChart3 }, { id: 'goals', label: 'Goals', icon: Target },
]
