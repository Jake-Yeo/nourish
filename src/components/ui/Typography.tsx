import { cva, type VariantProps } from 'class-variance-authority'
import type { ElementType, HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

const typographyVariants = cva('', {
  variants: {
    variant: {
      pageTitle: 'text-2xl font-extrabold tracking-tighter text-ink compact:text-3xl',
      sectionTitle: 'text-section font-bold tracking-tight text-ink',
      modalTitle: 'text-modal font-bold tracking-tight text-ink',
      eyebrow: 'text-eyebrow font-extrabold tracking-widest text-primary uppercase',
      body: 'text-body text-ink', muted: 'text-detail text-muted', caption: 'text-caption text-muted',
    },
  },
  defaultVariants: { variant: 'body' },
})

type TypographyProps = HTMLAttributes<HTMLElement> & VariantProps<typeof typographyVariants> & { as?: ElementType }

export function Typography({ as: Element = 'p', className, variant, ...typographyProps }: TypographyProps) {
  return <Element className={cn(typographyVariants({ variant }), className)} {...typographyProps} />
}
