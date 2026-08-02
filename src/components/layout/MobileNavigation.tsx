import { navigationItems } from '../../constants/navigationItems'
import type { NourishView } from '../../types/navigation'
import { cn } from '../../lib/cn'

export function MobileNavigation({ activeView, onViewChange }: { activeView: NourishView; onViewChange: (view: NourishView) => void }) {
  return <nav aria-label="Bottom navigation" className="fixed inset-x-0 bottom-0 z-20 grid h-navigation-height touch-none grid-cols-4 overflow-hidden overscroll-none border-t border-border bg-surface/95 px-control-wide pt-control pb-navigation-safe backdrop-blur-2xl desktop:hidden">
    {navigationItems.map(({ icon: NavigationIcon, id, label }) => <button className={cn('flex cursor-pointer flex-col items-center justify-center gap-control bg-transparent text-caption font-bold', activeView === id ? 'text-primary' : 'text-muted-icon')} key={id} onClick={() => onViewChange(id)}><NavigationIcon className="w-5" /><span>{label}</span></button>)}
  </nav>
}
