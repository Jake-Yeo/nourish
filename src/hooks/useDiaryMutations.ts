import type { DataMutation } from '../services/nutritionData/DataMutation'
import type { DiaryEntry, Food, MealType } from '../types'

type DiaryMutationOptions = {
  commitNutritionMutation: (mutation: DataMutation) => Promise<boolean>
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

  const addPhotoEntries = async (foods: Food[], mealType: MealType) => {
    const loggedAt = Date.now()
    const diaryEntries: DiaryEntry[] = foods.map((food, index) => ({ id: crypto.randomUUID(), date: options.selectedDateKey, meal: mealType, food, servings: 1, loggedAt: loggedAt + index, source: 'nourish-photo' }))
    if (await options.commitNutritionMutation({ type: 'addEntries', entries: diaryEntries })) {
      options.closePhotoMeal()
      options.showToast(`Estimated ${mealType.toLowerCase()} logged from ${foods.length} item${foods.length === 1 ? '' : 's'}`)
    }
  }

  const deleteDiaryEntry = (entryId: string) => options.commitNutritionMutation({ type: 'deleteEntry', id: entryId })
  return { addPhotoEntries, addQuickEntry, deleteDiaryEntry }
}
