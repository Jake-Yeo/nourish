import type { ReactNode } from 'react'
import { Stack } from './Stack'
import { Typography } from './Typography'

type SectionHeaderProps = { eyebrow: string; title: string; action?: ReactNode }

export function SectionHeader({ action, eyebrow, title }: SectionHeaderProps) {
  return <div className="mb-section flex items-end justify-between">
    <Stack gap="control"><Typography variant="eyebrow">{eyebrow}</Typography><Typography as="h2" variant="sectionTitle">{title}</Typography></Stack>
    {action}
  </div>
}
