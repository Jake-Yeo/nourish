import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

const stackDirections = { vertical: 'flex-col', horizontal: 'flex-row' }
const stackGaps = { control: 'gap-control', controlWide: 'gap-control-wide', content: 'gap-content', section: 'gap-section' }

type StackProps = HTMLAttributes<HTMLDivElement> & {
  direction?: keyof typeof stackDirections
  gap?: keyof typeof stackGaps
}

export function Stack({ className, direction = 'vertical', gap = 'content', ...stackProps }: StackProps) {
  return <div className={cn('flex', stackDirections[direction], stackGaps[gap], className)} {...stackProps} />
}
