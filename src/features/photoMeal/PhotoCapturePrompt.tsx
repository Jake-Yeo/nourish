import { Camera, Images } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { maximumMealPhotos } from '../../constants/photoMeal'

type PhotoCapturePromptProps = { onChooseFromLibrary: () => void; onTakePhoto: () => void }

export function PhotoCapturePrompt({ onChooseFromLibrary, onTakePhoto }: PhotoCapturePromptProps) {
  return <div className="flex min-h-64 w-full flex-col items-center justify-center gap-control rounded-sheet border border-dashed border-primary/40 bg-linear-to-br from-primary-soft to-canvas p-content text-primary">
    <span className="mb-control grid size-icon-large place-items-center rounded-sheet bg-primary text-surface shadow-primary"><Camera className="w-7" /></span>
    <strong className="text-lg text-ink">Add meal photos</strong>
    <small className="text-muted">Add up to {maximumMealPhotos} angles or separate dishes</small>
    <div className="mt-control flex w-full flex-col gap-control compact:w-auto compact:flex-row">
      <Button onClick={onTakePhoto}><Camera />Take a photo</Button>
      <Button variant="secondary" onClick={onChooseFromLibrary}><Images />Choose from library</Button>
    </div>
  </div>
}
