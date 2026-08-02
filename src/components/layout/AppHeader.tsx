import { Home, RefreshCw } from 'lucide-react'
import type { NourishView } from '../../types/navigation'
import { Button } from '../ui/Button'
import { Typography } from '../ui/Typography'
import { cn } from '../../lib/cn'

const viewTitles: Record<NourishView, string> = { today: 'Good day, Jake', diary: 'Diary', insights: 'Insights', goals: 'Goals' }

type AppHeaderProps = { activeView: NourishView; isSyncing: boolean; onGoalsOpen: () => void; onSync: () => void; onTodayOpen: () => void }

export function AppHeader({ activeView, isSyncing, onGoalsOpen, onSync, onTodayOpen }: AppHeaderProps) {
  return <header className="mb-card flex items-start justify-between compact:items-center">
    <div><Typography variant="eyebrow">Nutrition diary</Typography><Typography as="h1" variant="pageTitle" className="mt-control">{viewTitles[activeView]}</Typography></div>
    <div className="flex items-center gap-control">
      <Button variant="secondary" size="compact" onClick={onTodayOpen}><Home className="w-4" /><span className="sr-only compact:not-sr-only">Today</span></Button>
      <Button variant="secondary" size="compact" className="text-primary" onClick={onSync} disabled={isSyncing}><RefreshCw className={cn('w-4', isSyncing && 'animate-spin')} />{isSyncing ? 'Syncing' : 'Sync'}</Button>
      <Button size="icon" className="bg-ink shadow-none" onClick={onGoalsOpen}>J</Button>
    </div>
  </header>
}
