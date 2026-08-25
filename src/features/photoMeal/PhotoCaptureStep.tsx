import { useRef } from 'react'
import { Camera, ImagePlus, Sparkles } from 'lucide-react'
import type { MealType } from '../../types'
import type { CaptureFoodItem } from '../../types/photoMeal'
import { Button } from '../../components/ui/Button'
import { Field } from '../../components/ui/Field'
import { TextArea } from '../../components/ui/TextArea'
import { MealTypeSelector } from './MealTypeSelector'
import { PhotoCapturePrompt } from './PhotoCapturePrompt'
import { CaptureFoodItemCard } from './CaptureFoodItemCard'

type Props = { items: CaptureFoodItem[]; mealType: MealType; mealNote: string; error: string; isAnalyzing: boolean; submitLabel?: string; onAddFiles: (files: FileList | null, itemId?: string) => void; onAnalyze: () => void; onMealNoteChange: (note: string) => void; onMealTypeChange: (mealType: MealType) => void; onPhotoDelete: (id: string) => void; onPhotoNoteChange: (id: string, note: string) => void; onItemChange: (id: string, field: 'name' | 'description', value: string) => void }

export function PhotoCaptureStep(props: Props) {
  const newCamera = useRef<HTMLInputElement>(null)
  const newLibrary = useRef<HTMLInputElement>(null)
  const inputs = [[newCamera, true], [newLibrary, false]] as const
  const idleSubmitLabel = props.submitLabel || `Analyze ${props.items.length || ''} item${props.items.length === 1 ? '' : 's'}`
  return <fieldset disabled={props.isAnalyzing} className="m-0 min-w-0 border-0 p-0">
    <MealTypeSelector selectedMealType={props.mealType} onSelect={props.onMealTypeChange} />
    {!props.items.length && <PhotoCapturePrompt onChooseFromLibrary={() => newLibrary.current?.click()} onTakePhoto={() => newCamera.current?.click()} />}
    <div className="grid gap-control-wide">{props.items.map((item, index) => <CaptureFoodItemCard key={item.id} item={item} number={index + 1} onAddFiles={props.onAddFiles} onDelete={props.onPhotoDelete} onNoteChange={props.onPhotoNoteChange} onUpdate={props.onItemChange} />)}</div>
    {props.items.length > 0 && <div className="my-control-wide grid gap-control rounded-sheet border border-dashed border-primary/40 p-control-wide"><strong className="text-detail">Add new food item</strong><div className="grid gap-control compact:grid-cols-2"><Button variant="secondary" onClick={() => newCamera.current?.click()}><Camera />Camera</Button><Button variant="secondary" onClick={() => newLibrary.current?.click()}><ImagePlus />Camera roll</Button></div></div>}
    {inputs.map(([ref, camera], index) => <input key={index} ref={ref} hidden type="file" accept="image/*" capture={camera ? 'environment' : undefined} multiple={!camera} aria-label={`${props.items.length ? 'Add new food item from' : 'Add first food item from'} ${camera ? 'camera' : 'camera roll'}`} onChange={event => { props.onAddFiles(event.target.files); event.target.value = '' }} />)}
    <Field className="mt-content" label="Overall meal notes" optional><TextArea value={props.mealNote} onChange={event => props.onMealNoteChange(event.target.value)} placeholder="Anything shared across the whole meal" /></Field>
    <div className="my-control-wide flex gap-control-wide rounded-control bg-warning-soft p-control-wide text-warning"><Sparkles className="w-5 shrink-0" /><p className="text-caption leading-relaxed"><strong>Each group is analyzed as one food item.</strong> Use Add another angle when a second photo shows the same food.</p></div>
    {props.error && <p className="mb-control-wide rounded-field bg-destructive-soft p-control-wide text-detail text-destructive">{props.error}</p>}
    <Button fullWidth loading={props.isAnalyzing} disabled={!props.items.length} onClick={props.onAnalyze}><Sparkles />{props.isAnalyzing ? 'Saving analysis…' : idleSubmitLabel}</Button>
  </fieldset>
}
