import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

const badgeVariants = cva('inline-flex items-center rounded-pill font-extrabold', {
  variants: {
    variant: {
      primary: 'bg-primary-soft text-primary-strong', info: 'bg-info-soft text-info',
      ai: 'bg-ai-soft text-ai', neutral: 'bg-canvas text-muted', warning: 'bg-warning-soft text-warning',
      destructive: 'bg-destructive-soft text-destructive',
    },
    size: { default: 'gap-control px-control-wide py-control text-eyebrow uppercase tracking-widest', compact: 'px-control py-badge text-micro' },
  },
  defaultVariants: { variant: 'primary', size: 'default' },
})

type BadgeProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>

export function Badge({ className, variant, size, ...badgeProps }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...badgeProps} />
}
