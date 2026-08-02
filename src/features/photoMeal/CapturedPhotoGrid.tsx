import { ImagePlus } from 'lucide-react'
import type { CapturedPhoto } from '../../types/photoMeal'
import { Button } from '../../components/ui/Button'
import { CapturedPhotoCard } from './CapturedPhotoCard'

type CapturedPhotoGridProps = { photos: CapturedPhoto[]; onAddPhotos: () => void; onDelete: (photoId: string) => void; onNoteChange: (photoId: string, note: string) => void }

export function CapturedPhotoGrid({ onAddPhotos, onDelete, onNoteChange, photos }: CapturedPhotoGridProps) {
  return <div className="grid gap-control-wide">
    {photos.map((photo, photoIndex) => <CapturedPhotoCard key={photo.id} photo={photo} photoNumber={photoIndex + 1} onDelete={onDelete} onNoteChange={onNoteChange} />)}
    {photos.length < 6 && <Button variant="ghost" className="min-h-20 border border-dashed border-primary/40 bg-primary-soft" onClick={onAddPhotos}><ImagePlus />Add another angle</Button>}
  </div>
}
