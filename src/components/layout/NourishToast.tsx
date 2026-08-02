import { Sparkles } from 'lucide-react'

export function NourishToast({ message }: { message: string }) {
  if (!message) return null
  return <div className="pointer-events-none fixed top-card left-1/2 z-200 flex -translate-x-1/2 items-center gap-control rounded-control bg-ink px-content py-control-wide text-detail font-bold text-surface shadow-toast select-none"><Sparkles className="w-4 text-accent" />{message}</div>
}
