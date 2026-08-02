import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

const cardVariants = cva('rounded-card border', {
  variants: {
    variant: {
      elevated: 'border-border bg-surface shadow-card',
      flat: 'border-border bg-surface',
      soft: 'border-border bg-primary-soft',
      dark: 'border-transparent bg-primary-strong text-surface shadow-card',
    },
    padding: { none: '', default: 'p-card', large: 'p-card-large' },
  },
  defaultVariants: { variant: 'elevated', padding: 'default' },
})

type CardProps = HTMLAttributes<HTMLElement> & VariantProps<typeof cardVariants>

export function Card({ className, variant, padding, ...cardProps }: CardProps) {
  return <section className={cn(cardVariants({ variant, padding }), className)} {...cardProps} />
}
