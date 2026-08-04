import { useEffect, useState } from 'react'
import type { MealType } from '../types'
import type { CapturedPhoto } from '../types/photoMeal'
import { loadPhotoDraft } from '../services/photoDraft/loadPhotoDraft'
import { savePhotoDraft } from '../services/photoDraft/savePhotoDraft'
import { compressMealPhoto } from '../lib/photos/compressMealPhoto'
import { maximumMealPhotos } from '../constants/photoMeal'

export function usePhotoCapture(defaultMealType: MealType) {
  const [mealType, setMealType] = useState(defaultMealType)
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([])
  const [mealNote, setMealNote] = useState('')
  const [captureError, setCaptureError] = useState('')

  useEffect(() => {
    loadPhotoDraft().then(draft => {
      if (!draft?.photos?.length) return
      setCapturedPhotos(draft.photos)
      setMealNote(draft.mealNote || '')
      setMealType((draft.meal as MealType) || defaultMealType)
    }).catch(() => undefined)
  }, [defaultMealType])

  useEffect(() => {
    savePhotoDraft({ photos: capturedPhotos, mealNote, meal: mealType }).catch(() => undefined)
  }, [capturedPhotos, mealNote, mealType])

  const addPhotoFiles = async (photoFiles: FileList | null) => {
    if (!photoFiles) return
    setCaptureError('')
    try {
      const availablePhotoSlots = Math.max(0, maximumMealPhotos - capturedPhotos.length)
      const newPhotos: CapturedPhoto[] = []
      for (const photoFile of Array.from(photoFiles).slice(0, availablePhotoSlots)) {
        newPhotos.push({ id: crypto.randomUUID(), dataUrl: await compressMealPhoto(photoFile), note: '' })
      }
      setCapturedPhotos(currentPhotos => [...currentPhotos, ...newPhotos])
    } catch (error) {
      setCaptureError(error instanceof Error ? error.message : 'Could not add photo.')
    }
  }

  const removePhoto = (photoId: string) => setCapturedPhotos(currentPhotos => currentPhotos.filter(photo => photo.id !== photoId))
  const updatePhotoNote = (photoId: string, note: string) => setCapturedPhotos(currentPhotos => currentPhotos.map(photo => photo.id === photoId ? { ...photo, note } : photo))
  return { addPhotoFiles, capturedPhotos, captureError, mealNote, mealType, removePhoto, setCaptureError, setMealNote, setMealType, updatePhotoNote }
}
