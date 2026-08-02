import type { InputHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export function Input({ className, ...inputProps }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn('w-full rounded-field border border-border bg-surface p-field text-base text-ink outline-none focus:border-primary focus:ring-3 focus:ring-primary/15', className)} {...inputProps} />
}
