import { useRef } from 'react'
import { Camera, Images } from 'lucide-react'
import type { CaptureFoodItem } from '../../types/photoMeal'
import { Button } from '../../components/ui/Button'
import { Field } from '../../components/ui/Field'
import { Input } from '../../components/ui/Input'
import { TextArea } from '../../components/ui/TextArea'
import { CapturedPhotoGrid } from './CapturedPhotoGrid'

type Props = { item: CaptureFoodItem; number: number; onAddFiles: (files: FileList | null, itemId: string) => void; onDelete: (id: string) => void; onNoteChange: (id: string, note: string) => void; onUpdate: (id: string, field: 'name' | 'description', value: string) => void }

export function CaptureFoodItemCard({ item, number, onAddFiles, onDelete, onNoteChange, onUpdate }: Props) {
  const cameraInput = useRef<HTMLInputElement>(null)
  const libraryInput = useRef<HTMLInputElement>(null)
  const handleFiles = (input: HTMLInputElement) => { onAddFiles(input.files, item.id); input.value = '' }
  return <section className="grid gap-control rounded-sheet border border-border p-control-wide">
    <strong className="text-detail">Food item {number}</strong>
    <Field label="Name" optional><Input value={item.name} onChange={event => onUpdate(item.id, 'name', event.target.value)} placeholder="AI can suggest this" /></Field>
    <Field label="Description / photo notes" optional><TextArea value={item.description} onChange={event => onUpdate(item.id, 'description', event.target.value)} placeholder="Portion, ingredients, preparation, or what you ate" /></Field>
    <CapturedPhotoGrid photos={item.photos} hideAddControls onChooseFromLibrary={() => undefined} onTakePhoto={() => undefined} onDelete={onDelete} onNoteChange={onNoteChange} />
    <div className="grid gap-control rounded-control bg-primary-soft p-control-wide">
      <strong className="text-detail text-ink">Add another angle</strong>
      <div className="grid gap-control compact:grid-cols-2">
        <Button variant="secondary" size="compact" onClick={() => cameraInput.current?.click()}><Camera />Camera</Button>
        <Button variant="secondary" size="compact" onClick={() => libraryInput.current?.click()}><Images />Camera roll</Button>
      </div>
    </div>
    <input ref={cameraInput} hidden type="file" accept="image/*" capture="environment" aria-label={`Add camera angle to food item ${number}`} onChange={event => handleFiles(event.target)} />
    <input ref={libraryInput} hidden type="file" accept="image/*" multiple aria-label={`Add camera roll angles to food item ${number}`} onChange={event => handleFiles(event.target)} />
  </section>
}
