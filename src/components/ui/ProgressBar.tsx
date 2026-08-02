import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

type ProgressBarProps = HTMLAttributes<HTMLDivElement> & { percentage: number; indicatorClassName?: string }

export function ProgressBar({ className, indicatorClassName = 'bg-primary', percentage, ...progressBarProps }: ProgressBarProps) {
  return <div className={cn('h-2 overflow-hidden rounded-pill bg-progress-track', className)} {...progressBarProps}>
    <span className={cn('block h-full rounded-pill transition-[width] duration-300', indicatorClassName)} style={{ width: `${Math.min(Math.max(percentage, 0), 100)}%` }} />
  </div>
}
