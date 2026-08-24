import { useState } from 'react'
import type { DiaryEntry, MealType } from '../types'
import type { MealAnalysisSource } from '../types/photoMeal'

export function useNourishDialogs() {
  const [quickAddMeal, setQuickAddMeal] = useState<MealType | null>(null)
  const [photoMealType, setPhotoMealType] = useState<MealType | null>(null)
  const [photoMealSeed, setPhotoMealSeed] = useState<MealAnalysisSource | null>(null)
  const [selectedDiaryEntry, setSelectedDiaryEntry] = useState<DiaryEntry | null>(null)

  return {
    closeEntryDetails: () => setSelectedDiaryEntry(null), closePhotoMeal: () => { setPhotoMealType(null); setPhotoMealSeed(null) },
    closeQuickAdd: () => setQuickAddMeal(null), openEntryDetails: setSelectedDiaryEntry,
    openPhotoMeal: (mealType: MealType = 'Breakfast') => { setPhotoMealSeed(null); setPhotoMealType(mealType) },
    openPhotoMealRerun: (source: MealAnalysisSource) => { setPhotoMealSeed(source); setPhotoMealType(source.mealType) },
    openQuickAdd: (mealType: MealType = 'Breakfast') => setQuickAddMeal(mealType),
    photoMealSeed, photoMealType, quickAddMeal, selectedDiaryEntry,
  }
}
