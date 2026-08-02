import { Camera } from 'lucide-react'
import { Button } from '../ui/Button'

export function FloatingPhotoButton({ onClick }: { onClick: () => void }) {
  return <Button size="icon" className="fixed right-page-mobile bottom-floating-button-offset z-20 size-14 border-4 border-canvas shadow-floating desktop:hidden" onClick={() => onClick()} aria-label="Photograph meal"><Camera /></Button>
}
