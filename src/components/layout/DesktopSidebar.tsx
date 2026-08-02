import { Apple, CircleUserRound } from 'lucide-react'
import { navigationItems } from '../../constants/navigationItems'
import type { NourishView } from '../../types/navigation'
import { cn } from '../../lib/cn'

export function DesktopSidebar({ activeView, onViewChange }: { activeView: NourishView; onViewChange: (view: NourishView) => void }) {
  return <aside className="hidden h-dvh flex-col border-r border-border bg-surface px-card py-card-large desktop:flex">
    <div className="mx-control mb-page-desktop flex items-center gap-control-wide text-section"><span className="grid size-icon-small place-items-center rounded-icon bg-primary text-surface"><Apple className="w-5" /></span><strong>Nourish</strong></div>
    <nav className="grid gap-control">{navigationItems.map(({ icon: NavigationIcon, id, label }) => <button className={cn('flex cursor-pointer items-center gap-control-wide rounded-control px-control-wide py-control-wide text-left font-bold', activeView === id ? 'bg-primary-soft text-primary-strong' : 'bg-transparent text-muted hover:bg-canvas')} key={id} onClick={() => onViewChange(id)}><NavigationIcon className="w-5" />{label}</button>)}</nav>
    <div className="mt-auto flex items-center gap-control-wide rounded-control bg-canvas p-control-wide"><CircleUserRound /><span className="flex flex-col"><strong>Jake</strong><small className="text-muted">Personal diary</small></span></div>
  </aside>
}
