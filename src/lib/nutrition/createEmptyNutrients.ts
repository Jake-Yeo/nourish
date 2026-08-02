import type { Nutrients } from '../../types'

export function createEmptyNutrients(): Nutrients {
  return {
    calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0,
    sodium: 0, saturatedFat: 0, cholesterol: 0, potassium: 0, calcium: 0, iron: 0,
  }
}
