import type { TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export function TextArea({ className, ...textAreaProps }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn('min-h-20 w-full resize-y rounded-field border border-border bg-surface p-field text-base leading-relaxed text-ink outline-none focus:border-primary focus:ring-3 focus:ring-primary/15', className)} {...textAreaProps} />
}
