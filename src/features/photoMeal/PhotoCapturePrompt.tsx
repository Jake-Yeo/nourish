import { Camera } from 'lucide-react'

export function PhotoCapturePrompt({ onSelectPhotos }: { onSelectPhotos: () => void }) {
  return <button className="flex min-h-64 w-full cursor-pointer flex-col items-center justify-center gap-control rounded-sheet border border-dashed border-primary/40 bg-linear-to-br from-primary-soft to-canvas text-primary" onClick={onSelectPhotos}>
    <span className="mb-control grid size-icon-large place-items-center rounded-sheet bg-primary text-surface shadow-primary"><Camera className="w-7" /></span>
    <strong className="text-lg text-ink">Take meal photos</strong>
    <small className="text-muted">Add up to 6 angles or separate dishes</small>
  </button>
}
