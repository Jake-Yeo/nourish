import type { MealType } from '../../types'
import { useMealEstimate } from '../../hooks/useMealEstimate'
import { usePhotoCapture } from '../../hooks/usePhotoCapture'
import { Modal } from '../../components/ui/Modal'
import { ModalHeader } from '../../components/ui/ModalHeader'
import { PhotoCaptureStep } from './PhotoCaptureStep'
import type { MealAnalysisJob, MealAnalysisSource } from '../../types/photoMeal'

export function PhotoMealModal({ defaultMealType, initialSource, selectedDateKey, onClose, onQueued }: { defaultMealType: MealType; initialSource?: MealAnalysisSource; selectedDateKey: string; onClose: () => void; onQueued: (job: MealAnalysisJob) => void }) {
  const capture = usePhotoCapture(defaultMealType, initialSource)
  const analysis = useMealEstimate()
  const queue = async () => {
    const sourceDate = initialSource?.date ?? selectedDateKey
    const job = await analysis.queueMealAnalysis(capture.items, capture.mealNote, capture.mealType, sourceDate, initialSource?.replacement)
    if (job) { onClose(); onQueued(job) }
  }
  return <Modal accessibleLabel="AI meal estimate" onClose={onClose} width="wide">
    <ModalHeader eyebrow="AI meal estimate" title="Photograph your meal" onClose={onClose} />
    <PhotoCaptureStep items={capture.items} mealType={capture.mealType} mealNote={capture.mealNote} error={analysis.analysisError || capture.captureError} onAddFiles={capture.addPhotoFiles} onAnalyze={queue} onItemChange={capture.updateItem} onMealNoteChange={capture.setMealNote} onMealTypeChange={capture.setMealType} onPhotoDelete={capture.removePhoto} onPhotoNoteChange={capture.updatePhotoNote} />
    {analysis.isQueuing && <p className="mt-control text-center text-caption text-muted">Saving analysis…</p>}
  </Modal>
}
