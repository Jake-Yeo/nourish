import { useState } from 'react'
import type { Food, MealType } from '../types'
import { createEmptyNutrients } from '../lib/nutrition/createEmptyNutrients'

type QuickAddValues = { name: string; calories: string; protein: string; fiber: string }

export function useQuickAddForm(mealType: MealType, onLog: (food: Food, mealType: MealType) => void) {
  const [quickAddValues, setQuickAddValues] = useState<QuickAddValues>({ name: '', calories: '', protein: '', fiber: '' })
  const [validationMessage, setValidationMessage] = useState('')
  const updateQuickAddValue = (fieldName: keyof QuickAddValues, value: string) => setQuickAddValues(currentValues => ({ ...currentValues, [fieldName]: value }))

  const submitQuickAdd = () => {
    if (![quickAddValues.calories, quickAddValues.protein, quickAddValues.fiber].some(value => value !== '')) {
      setValidationMessage('Add at least one nutritional value.')
      return
    }
    const nutrients = createEmptyNutrients()
    for (const nutrientName of ['calories', 'protein', 'fiber'] as const) nutrients[nutrientName] = Math.max(0, Number(quickAddValues[nutrientName]) || 0)
    const food: Food = { id: `quick-${crypto.randomUUID()}`, name: quickAddValues.name.trim() || 'Quick add', servingLabel: '1 entry', servingGrams: 0, nutrients, source: 'custom' }
    onLog(food, mealType)
  }

  return { quickAddValues, submitQuickAdd, updateQuickAddValue, validationMessage }
}
