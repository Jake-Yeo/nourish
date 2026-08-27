import type { MealType } from '../../types'
import { useMealEstimate } from '../../hooks/useMealEstimate'
import { usePhotoCapture } from '../../hooks/usePhotoCapture'
import { Modal } from '../../components/ui/Modal'
import { ModalHeader } from '../../components/ui/ModalHeader'
import { PhotoCaptureStep } from './PhotoCaptureStep'
import type { MealAnalysisJob } from '../../types/photoMeal'

export function PhotoMealModal({ defaultMealType, initialJob, selectedDateKey, onClose, onQueued }: { defaultMealType: MealType; initialJob?: MealAnalysisJob; selectedDateKey: string; onClose: () => void; onQueued: (job: MealAnalysisJob) => void }) {
  const initialSource = initialJob?.source
  const capture = usePhotoCapture(defaultMealType, initialSource)
  const analysis = useMealEstimate()
  const queue = async () => {
    const sourceDate = initialSource?.date ?? selectedDateKey
    const job = await analysis.queueMealAnalysis(capture.items, capture.mealNote, capture.mealType, sourceDate, initialSource?.replacement, initialJob?.id)
    if (job) { onClose(); onQueued(job) }
  }
  return <Modal accessibleLabel="AI meal estimate" onClose={onClose} width="wide">
    <ModalHeader eyebrow="AI meal estimate" title={initialJob ? 'Add details and re-run' : 'Photograph your meal'} onClose={onClose} />
    <PhotoCaptureStep items={capture.items} mealType={capture.mealType} mealNote={capture.mealNote} error={analysis.analysisError || capture.captureError} isAnalyzing={analysis.isQueuing} lockItemSet={Boolean(initialJob?.loggedAt)} submitLabel={initialJob ? 'Re-run AI for this item' : undefined} onAddFiles={capture.addPhotoFiles} onAnalyze={queue} onItemChange={capture.updateItem} onMealNoteChange={capture.setMealNote} onMealTypeChange={capture.setMealType} onPhotoDelete={capture.removePhoto} onPhotoNoteChange={capture.updatePhotoNote} />
    {analysis.isQueuing && <p className="mt-control text-center text-caption text-muted" role="status">Saving analysis…</p>}
  </Modal>
}
