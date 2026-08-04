import { Camera, ImagePlus } from 'lucide-react'
import type { CapturedPhoto } from '../../types/photoMeal'
import { Button } from '../../components/ui/Button'
import { CapturedPhotoCard } from './CapturedPhotoCard'
import { maximumMealPhotos } from '../../constants/photoMeal'

type CapturedPhotoGridProps = { photos: CapturedPhoto[]; onChooseFromLibrary: () => void; onTakePhoto: () => void; onDelete: (photoId: string) => void; onNoteChange: (photoId: string, note: string) => void }

export function CapturedPhotoGrid({ onChooseFromLibrary, onDelete, onNoteChange, onTakePhoto, photos }: CapturedPhotoGridProps) {
  return <div className="grid gap-control-wide">
    {photos.map((photo, photoIndex) => <CapturedPhotoCard key={photo.id} photo={photo} photoNumber={photoIndex + 1} onDelete={onDelete} onNoteChange={onNoteChange} />)}
    {photos.length < maximumMealPhotos && <div className="flex min-h-20 flex-col items-stretch justify-center gap-control rounded-sheet border border-dashed border-primary/40 bg-primary-soft p-control compact:flex-row compact:items-center">
      <Button variant="ghost" size="compact" onClick={onTakePhoto}><Camera />Take another</Button>
      <Button variant="ghost" size="compact" onClick={onChooseFromLibrary}><ImagePlus />Choose photos</Button>
    </div>}
  </div>
}
