import { useState } from 'react'
import { Camera, ImagePlus } from 'lucide-react'
import type { CapturedPhoto } from '../../types/photoMeal'
import { Button } from '../../components/ui/Button'
import { CapturedPhotoCard } from './CapturedPhotoCard'
import { maximumMealPhotos } from '../../constants/photoMeal'
import { PhotoViewer } from './PhotoViewer'

type CapturedPhotoGridProps = { photos: CapturedPhoto[]; canDelete?: boolean; hideAddControls?: boolean; readOnly?: boolean; onChooseFromLibrary: () => void; onTakePhoto: () => void; onDelete: (photoId: string) => void; onNoteChange: (photoId: string, note: string) => void }

export function CapturedPhotoGrid({ canDelete, hideAddControls, onChooseFromLibrary, onDelete, onNoteChange, onTakePhoto, photos, readOnly }: CapturedPhotoGridProps) {
  const [viewedPhoto, setViewedPhoto] = useState<{ photo: CapturedPhoto; number: number } | null>(null)
  return <div className="grid gap-control-wide">
    {photos.map((photo, photoIndex) => <CapturedPhotoCard canDelete={canDelete} key={photo.id} photo={photo} photoNumber={photoIndex + 1} onDelete={onDelete} onNoteChange={onNoteChange} onView={(selected, number) => setViewedPhoto({ photo: selected, number })} readOnly={readOnly} />)}
    {!readOnly && !hideAddControls && photos.length < maximumMealPhotos && <div className="flex min-h-20 flex-col items-stretch justify-center gap-control rounded-sheet border border-dashed border-primary/40 bg-primary-soft p-control compact:flex-row compact:items-center">
      <Button variant="ghost" size="compact" onClick={onTakePhoto}><Camera />Take another</Button>
      <Button variant="ghost" size="compact" onClick={onChooseFromLibrary}><ImagePlus />Choose photos</Button>
    </div>}
    {viewedPhoto && <PhotoViewer alt={`Meal photo ${viewedPhoto.number}`} dataUrl={viewedPhoto.photo.dataUrl} onClose={() => setViewedPhoto(null)} />}
  </div>
}
