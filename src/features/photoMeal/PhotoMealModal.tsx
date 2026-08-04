import { ChevronLeft } from 'lucide-react'
import type { Food, MealType } from '../../types'
import type { MealEstimateExplanation } from '../../types/photoMeal'
import { useMealEstimate } from '../../hooks/useMealEstimate'
import { usePhotoCapture } from '../../hooks/usePhotoCapture'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { ModalHeader } from '../../components/ui/ModalHeader'
import { MealAnalysisLoading } from './MealAnalysisLoading'
import { MealEstimateReview } from './MealEstimateReview'
import { PhotoCaptureStep } from './PhotoCaptureStep'

export function PhotoMealModal({ defaultMealType, onClose, onLog }: { defaultMealType: MealType; onClose: () => void; onLog: (foods: Food[], mealType: MealType, explanation: MealEstimateExplanation) => Promise<boolean> }) {
  const capture = usePhotoCapture(defaultMealType)
  const estimate = useMealEstimate(onLog)
  const modalTitle = estimate.activeStep === 'review' ? estimate.mealEstimate?.mealName : estimate.activeStep === 'analyzing' ? 'Analyzing your meal' : 'Photograph your meal'
  const leadingAction = estimate.activeStep === 'review' ? <Button variant="secondary" size="icon" className="absolute top-control -left-page-mobile" onClick={() => estimate.setActiveStep('capture')} aria-label="Back to photos"><ChevronLeft /></Button> : undefined
  const captureError = estimate.analysisError || capture.captureError

  return <Modal accessibleLabel="AI meal estimate" onClose={onClose} width="wide">
    <ModalHeader eyebrow="AI meal estimate" leadingAction={leadingAction} title={modalTitle} onClose={onClose} />
    {estimate.activeStep === 'capture' && <PhotoCaptureStep photos={capture.capturedPhotos} mealType={capture.mealType} mealNote={capture.mealNote} error={captureError} onAddFiles={capture.addPhotoFiles} onAnalyze={() => estimate.analyzeMealPhotos(capture.capturedPhotos, capture.mealNote)} onMealNoteChange={capture.setMealNote} onMealTypeChange={capture.setMealType} onPhotoDelete={capture.removePhoto} onPhotoNoteChange={capture.updatePhotoNote} />}
    {estimate.activeStep === 'analyzing' && <MealAnalysisLoading />}
    {estimate.activeStep === 'review' && estimate.mealEstimate && <MealEstimateReview estimate={estimate.mealEstimate} mealType={capture.mealType} onFieldChange={estimate.updateEstimatedItem} onLog={estimate.logEstimatedMeal} onNutrientChange={estimate.updateEstimatedNutrient} />}
  </Modal>
}
