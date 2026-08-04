import { useRef } from 'react'
import { Sparkles } from 'lucide-react'
import type { MealType } from '../../types'
import type { CapturedPhoto } from '../../types/photoMeal'
import { Button } from '../../components/ui/Button'
import { Field } from '../../components/ui/Field'
import { TextArea } from '../../components/ui/TextArea'
import { MealTypeSelector } from './MealTypeSelector'
import { PhotoCapturePrompt } from './PhotoCapturePrompt'
import { CapturedPhotoGrid } from './CapturedPhotoGrid'

type PhotoCaptureStepProps = { photos: CapturedPhoto[]; mealType: MealType; mealNote: string; error: string; onAddFiles: (files: FileList | null) => void; onAnalyze: () => void; onMealNoteChange: (note: string) => void; onMealTypeChange: (mealType: MealType) => void; onPhotoDelete: (photoId: string) => void; onPhotoNoteChange: (photoId: string, note: string) => void }

export function PhotoCaptureStep(props: PhotoCaptureStepProps) {
  const cameraInput = useRef<HTMLInputElement>(null)
  const libraryInput = useRef<HTMLInputElement>(null)
  const takePhoto = () => cameraInput.current?.click()
  const chooseFromLibrary = () => libraryInput.current?.click()
  return <div>
    <MealTypeSelector selectedMealType={props.mealType} onSelect={props.onMealTypeChange} />
    {props.photos.length ? <CapturedPhotoGrid photos={props.photos} onChooseFromLibrary={chooseFromLibrary} onTakePhoto={takePhoto} onDelete={props.onPhotoDelete} onNoteChange={props.onPhotoNoteChange} /> : <PhotoCapturePrompt onChooseFromLibrary={chooseFromLibrary} onTakePhoto={takePhoto} />}
    <input ref={cameraInput} hidden type="file" accept="image/*" capture="environment" onChange={event => { props.onAddFiles(event.target.files); event.target.value = '' }} />
    <input ref={libraryInput} hidden type="file" accept="image/*" multiple onChange={event => { props.onAddFiles(event.target.files); event.target.value = '' }} />
    <Field className="mt-content" label="Overall meal notes" optional><TextArea value={props.mealNote} onChange={event => props.onMealNoteChange(event.target.value)} placeholder="Anything the photos don't show—restaurant, shared plates, cooking oil, what you left behind…" /></Field>
    <div className="my-control-wide flex gap-control-wide rounded-control bg-warning-soft p-control-wide text-warning"><Sparkles className="w-5 shrink-0" /><p className="text-caption leading-relaxed"><strong>Photos provide estimates, not measurements.</strong> Notes about portions and hidden ingredients make the result much better.</p></div>
    {props.error && <p className="mb-control-wide rounded-field bg-destructive-soft p-control-wide text-detail text-destructive">{props.error}</p>}
    <Button fullWidth disabled={!props.photos.length} onClick={props.onAnalyze}><Sparkles />Analyze {props.photos.length || ''} photo{props.photos.length === 1 ? '' : 's'}</Button>
  </div>
}
