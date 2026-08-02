import { useState } from 'react'
import type { DiaryEntry, MealType } from '../types'

export function useNourishDialogs() {
  const [quickAddMeal, setQuickAddMeal] = useState<MealType | null>(null)
  const [photoMealType, setPhotoMealType] = useState<MealType | null>(null)
  const [selectedDiaryEntry, setSelectedDiaryEntry] = useState<DiaryEntry | null>(null)

  return {
    closeEntryDetails: () => setSelectedDiaryEntry(null), closePhotoMeal: () => setPhotoMealType(null),
    closeQuickAdd: () => setQuickAddMeal(null), openEntryDetails: setSelectedDiaryEntry,
    openPhotoMeal: (mealType: MealType = 'Breakfast') => setPhotoMealType(mealType),
    openQuickAdd: (mealType: MealType = 'Breakfast') => setQuickAddMeal(mealType),
    photoMealType, quickAddMeal, selectedDiaryEntry,
  }
}
