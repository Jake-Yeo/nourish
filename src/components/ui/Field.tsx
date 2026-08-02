import type { LabelHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

type FieldProps = LabelHTMLAttributes<HTMLLabelElement> & { label: ReactNode; optional?: boolean }

export function Field({ children, className, label, optional, ...labelProps }: FieldProps) {
  return <label className={cn('grid gap-control text-caption font-bold text-muted', className)} {...labelProps}>
    <span>{label}{optional && <small className="ml-control font-medium">optional</small>}</span>
    {children}
  </label>
}
