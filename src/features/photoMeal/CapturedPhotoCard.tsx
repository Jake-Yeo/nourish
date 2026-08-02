import { Trash2 } from 'lucide-react'
import type { CapturedPhoto } from '../../types/photoMeal'
import { Button } from '../../components/ui/Button'
import { Field } from '../../components/ui/Field'
import { TextArea } from '../../components/ui/TextArea'

type CapturedPhotoCardProps = { photo: CapturedPhoto; photoNumber: number; onDelete: (photoId: string) => void; onNoteChange: (photoId: string, note: string) => void }

export function CapturedPhotoCard({ onDelete, onNoteChange, photo, photoNumber }: CapturedPhotoCardProps) {
  return <div className="relative grid grid-cols-1 gap-control-wide rounded-sheet border border-border bg-canvas p-control compact:grid-cols-captured-photo">
    <img className="h-48 w-full rounded-control object-cover compact:h-28 compact:w-32" src={photo.dataUrl} alt={`Meal ${photoNumber}`} />
    <Button variant="destructive" size="icon" className="absolute top-control-wide right-control-wide bg-ink/75 text-surface compact:right-auto compact:left-28" onClick={() => onDelete(photo.id)} aria-label={`Delete photo ${photoNumber}`}><Trash2 className="w-4" /></Button>
    <Field label={`Photo ${photoNumber} notes`}><TextArea value={photo.note} onChange={event => onNoteChange(photo.id, event.target.value)} placeholder="e.g. 8 oz ribeye, ate about ¾; butter sauce" /></Field>
  </div>
}
