import { useRef, useState } from 'react'
import { cn } from '../../lib/cn'

export function ModalHandle({ onClose }: { onClose: () => void }) {
  const pointerStartPosition = useRef<number | null>(null)
  const [dragOffset, setDragOffset] = useState(0)
  const resetDragPosition = () => { pointerStartPosition.current = null; setDragOffset(0) }

  return <button type="button" className={cn('mx-auto mb-control block h-7 w-14 touch-none cursor-grab bg-transparent active:cursor-grabbing')} aria-label="Dismiss" style={{ transform: `translateY(${dragOffset}px)` }} onClick={onClose}
    onPointerDown={event => { pointerStartPosition.current = event.clientY; event.currentTarget.setPointerCapture(event.pointerId) }}
    onPointerMove={event => { if (pointerStartPosition.current !== null) setDragOffset(Math.max(0, Math.min(22, (event.clientY - pointerStartPosition.current) / 4))) }}
    onPointerUp={event => {
      const dragDistance = pointerStartPosition.current === null ? 0 : event.clientY - pointerStartPosition.current
      resetDragPosition()
      if (dragDistance > 55) onClose()
    }} onPointerCancel={resetDragPosition}>
    <span className="mx-auto block h-1.5 w-10 rounded-pill bg-border" />
  </button>
}
