import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { Button } from './Button'
import { Stack } from './Stack'
import { Typography } from './Typography'

type ModalHeaderProps = { eyebrow: string; title: ReactNode; onClose: () => void; closeDisabled?: boolean; leadingAction?: ReactNode }

export function ModalHeader({ closeDisabled = false, eyebrow, leadingAction, onClose, title }: ModalHeaderProps) {
  return <header className="flex items-center justify-between pb-content">
    <Stack className="relative" gap="control">
      {leadingAction}
      <Typography variant="eyebrow">{eyebrow}</Typography>
      <Typography as="h2" variant="modalTitle">{title}</Typography>
    </Stack>
    <Button variant="secondary" size="icon" disabled={closeDisabled} onClick={onClose} aria-label="Close"><X className="w-5" /></Button>
  </header>
}
