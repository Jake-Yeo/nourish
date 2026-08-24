import type { DataMutation } from '../services/nutritionData/DataMutation'
import type { DiaryEntry, Food, MealType } from '../types'
import type { CaptureFoodItem, MealEstimateExplanation } from '../types/photoMeal'

type DiaryMutationOptions = {
  commitNutritionMutation: (mutation: DataMutation) => Promise<boolean>
  commitPhotoMeal: (entries: DiaryEntry[], items: CaptureFoodItem[], mealNote: string, analysisJobId?: string) => Promise<boolean>
  selectedDateKey: string
  showToast: (message: string) => void
  closePhotoMeal: () => void
  closeQuickAdd: () => void
}

export function useDiaryMutations(options: DiaryMutationOptions) {
  const addQuickEntry = async (food: Food, mealType: MealType) => {
    const diaryEntry: DiaryEntry = { id: crypto.randomUUID(), date: options.selectedDateKey, meal: mealType, food, servings: 1, loggedAt: Date.now(), source: 'nourish-manual' }
    if (await options.commitNutritionMutation({ type: 'addEntries', entries: [diaryEntry] })) {
      options.closeQuickAdd()
      options.showToast(`${food.name} added to ${mealType.toLowerCase()}`)
    }
  }

  const addPhotoEntries = async (foods: Food[], items: CaptureFoodItem[], mealType: MealType, aiPhotoExplanation: MealEstimateExplanation, mealNote: string, date = options.selectedDateKey, analysisJobId?: string) => {
    const loggedAt = Date.now()
    const diaryEntries: DiaryEntry[] = foods.map((food, index) => ({ id: crypto.randomUUID(), date, meal: mealType, food, servings: 1, loggedAt: loggedAt + index, source: 'nourish-photo', aiPhotoExplanation }))
    const persisted = await options.commitPhotoMeal(diaryEntries, items, mealNote, analysisJobId)
    if (persisted) {
      options.closePhotoMeal()
      options.showToast(`Estimated ${mealType.toLowerCase()} logged from ${foods.length} item${foods.length === 1 ? '' : 's'}`)
    }
    return persisted
  }

  const deleteDiaryEntry = (entryId: string) => options.commitNutritionMutation({ type: 'deleteEntry', id: entryId })
  const moveDiaryEntries = (entryIds: string[], date: string, meal: MealType) => options.commitNutritionMutation({ type: 'moveEntries', ids: entryIds, date, meal }).then(persisted => { if (persisted) options.showToast(`Moved ${entryIds.length} item${entryIds.length === 1 ? '' : 's'} to ${meal.toLowerCase()}`); return persisted })
  return { addPhotoEntries, addQuickEntry, deleteDiaryEntry, moveDiaryEntries }
}
