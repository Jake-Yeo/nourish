import { useEffect, useState } from 'react'
import type { MealType } from '../types'
import type { CaptureFoodItem, CapturedPhoto, MealAnalysisSource } from '../types/photoMeal'
import { loadPhotoDraft } from '../services/photoDraft/loadPhotoDraft'
import { savePhotoDraft } from '../services/photoDraft/savePhotoDraft'
import { compressMealPhoto } from '../lib/photos/compressMealPhoto'
import { maximumMealPhotos } from '../constants/photoMeal'

function legacyDraftItems(draft: unknown): CaptureFoodItem[] {
  const value = draft as { items?: CaptureFoodItem[]; photos?: CapturedPhoto[] }
  if (Array.isArray(value.items)) return value.items
  return (value.photos || []).map(photo => ({ id: crypto.randomUUID(), name: '', description: '', photos: [photo] }))
}

async function compressFiles(photoFiles: FileList, available: number) {
  const photos: CapturedPhoto[] = []
  for (const file of Array.from(photoFiles).slice(0, available)) photos.push({ id: crypto.randomUUID(), dataUrl: await compressMealPhoto(file), note: '' })
  return photos
}

export function usePhotoCapture(defaultMealType: MealType, initialSource?: MealAnalysisSource) {
  const [mealType, setMealType] = useState(initialSource?.mealType ?? defaultMealType)
  const [items, setItems] = useState<CaptureFoodItem[]>(initialSource?.items ?? [])
  const [mealNote, setMealNote] = useState(initialSource?.note ?? '')
  const [captureError, setCaptureError] = useState('')
  const photos = items.flatMap(item => item.photos)

  useEffect(() => { loadPhotoDraft().then(draft => {
    if (!draft || initialSource) return
    setItems(legacyDraftItems(draft)); setMealNote(draft.mealNote || ''); setMealType((draft.meal as MealType) || defaultMealType)
  }).catch(() => undefined) }, [defaultMealType, initialSource])
  useEffect(() => { savePhotoDraft({ items, mealNote, meal: mealType }).catch(() => undefined) }, [items, mealNote, mealType])

  const addPhotoFiles = async (files: FileList | null, itemId?: string) => {
    if (!files) return
    setCaptureError('')
    try {
      const added = await compressFiles(files, Math.max(0, maximumMealPhotos - photos.length))
      setItems(current => {
        if (itemId) return current.map(item => item.id === itemId ? { ...item, photos: [...item.photos, ...added] } : item)
        if (!added.length) return current
        return [...current, { id: crypto.randomUUID(), name: '', description: '', photos: added }]
      })
    } catch (error) { setCaptureError(error instanceof Error ? error.message : 'Could not add photo.') }
  }
  const removePhoto = (photoId: string) => setItems(current => current.map(item => ({ ...item, photos: item.photos.filter(photo => photo.id !== photoId) })).filter(item => item.photos.length))
  const updatePhotoNote = (photoId: string, note: string) => setItems(current => current.map(item => ({ ...item, photos: item.photos.map(photo => photo.id === photoId ? { ...photo, note } : photo) })))
  const updateItem = (itemId: string, field: 'name' | 'description', value: string) => setItems(current => current.map(item => item.id === itemId ? { ...item, [field]: value } : item))
  return { addPhotoFiles, captureError, items, mealNote, mealType, photos, removePhoto, setMealNote, setMealType, updateItem, updatePhotoNote }
}
