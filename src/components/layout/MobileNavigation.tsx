import { navigationItems } from '../../constants/navigationItems'
import type { NourishView } from '../../types/navigation'
import { cn } from '../../lib/cn'

export function MobileNavigation({ activeView, onViewChange }: { activeView: NourishView; onViewChange: (view: NourishView) => void }) {
  return <nav aria-label="Bottom navigation" className="fixed inset-x-0 bottom-0 z-20 grid h-navigation-height touch-none grid-flow-col auto-cols-fr overflow-hidden overscroll-none border-t border-border bg-surface/95 pt-control pb-navigation-safe backdrop-blur-2xl desktop:hidden">
    {navigationItems.map(({ icon: NavigationIcon, id, label }) => <button aria-label={label} className={cn('flex min-w-0 cursor-pointer flex-col items-center justify-center gap-control overflow-hidden bg-transparent px-badge text-micro font-bold whitespace-nowrap compact:px-control compact:text-caption', activeView === id ? 'text-primary' : 'text-muted-icon')} key={id} onClick={() => onViewChange(id)}><NavigationIcon className="w-4 shrink-0 compact:w-5" aria-hidden="true" /><span className="block w-full truncate text-center">{label}</span></button>)}
  </nav>
}
