import { useRef, useState } from 'react'

export function ModalHandle({ onClose }: { onClose: () => void }) {
  const startY = useRef<number | null>(null)
  const [offset, setOffset] = useState(0)

  return <button
    type="button"
    className="modal-handle"
    aria-label="Dismiss"
    style={{ transform: `translateY(${offset}px)` }}
    onClick={onClose}
    onPointerDown={event => { startY.current = event.clientY; event.currentTarget.setPointerCapture(event.pointerId) }}
    onPointerMove={event => { if (startY.current !== null) setOffset(Math.max(0, Math.min(22, (event.clientY - startY.current) / 4))) }}
    onPointerUp={event => {
      const distance = startY.current === null ? 0 : event.clientY - startY.current
      startY.current = null; setOffset(0)
      if (distance > 55) onClose()
    }}
    onPointerCancel={() => { startY.current = null; setOffset(0) }}
  />
}
