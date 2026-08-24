import { X } from 'lucide-react'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'

export function PhotoViewer({ alt, dataUrl, onClose }: { alt: string; dataUrl: string; onClose: () => void }) {
  return <Modal accessibleLabel={`${alt} full-size viewer`} onClose={onClose} width="wide">
    <div className="flex justify-end"><Button size="icon" variant="secondary" onClick={onClose} aria-label="Close image viewer"><X /></Button></div>
    <img className="mt-control max-h-[75dvh] w-full rounded-control object-contain" src={dataUrl} alt={alt} />
  </Modal>
}
