import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

const buttonVariants = cva('inline-flex cursor-pointer items-center justify-center font-extrabold transition-all duration-150 ease-out hover:brightness-95 active:scale-95 active:brightness-90 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:brightness-100 disabled:active:scale-100', {
  variants: {
    variant: {
      primary: 'rounded-button bg-primary text-surface shadow-primary hover:bg-primary-strong',
      secondary: 'rounded-control border border-border bg-surface text-ink hover:bg-canvas',
      ghost: 'bg-transparent text-primary hover:text-primary-strong',
      destructive: 'bg-transparent text-destructive hover:bg-destructive-soft',
    },
    size: {
      default: 'min-h-12 gap-control px-content py-control',
      compact: 'min-h-10 gap-control px-control-wide py-control text-detail',
      icon: 'size-icon-control rounded-full',
    },
    fullWidth: { true: 'w-full' },
  },
  defaultVariants: { variant: 'primary', size: 'default' },
})

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>

export function Button({ className, variant, size, fullWidth, type = 'button', ...buttonProps }: ButtonProps) {
  return <button type={type} className={cn(buttonVariants({ variant, size, fullWidth }), className)} {...buttonProps} />
}
