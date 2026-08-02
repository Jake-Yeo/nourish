import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { ModalHandle } from './ModalHandle'

type ModalProps = HTMLAttributes<HTMLDivElement> & {
  accessibleLabel: string
  children: ReactNode
  onClose: () => void
  width?: 'default' | 'wide'
}

const modalWidths = { default: 'max-w-modal', wide: 'max-w-photo-modal' }

export function Modal({ accessibleLabel, children, className, onClose, width = 'default', ...modalProps }: ModalProps) {
  return <div className="fixed inset-0 z-100 flex items-end justify-center bg-overlay pt-card-large backdrop-blur-sm desktop:items-center desktop:p-page-desktop">
    <div className={cn('max-h-[92dvh] w-full overflow-x-hidden overflow-y-auto overscroll-contain rounded-t-modal bg-surface px-modal-x pt-modal-top pb-modal-safe text-ink shadow-modal [-webkit-overflow-scrolling:touch] desktop:max-h-[88dvh] desktop:rounded-modal', modalWidths[width], className)} role="dialog" aria-modal="true" aria-label={accessibleLabel} {...modalProps}>
      <ModalHandle onClose={onClose} />
      {children}
    </div>
  </div>
}
