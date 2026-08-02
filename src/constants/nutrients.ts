import type { Nutrients } from '../types'

export const primaryNutrients: Array<{ key: keyof Nutrients; label: string; unit: string; indicatorClassName: string }> = [
  { key: 'protein', label: 'Protein', unit: 'g', indicatorClassName: 'bg-protein' },
  { key: 'carbs', label: 'Carbs', unit: 'g', indicatorClassName: 'bg-carbs' },
  { key: 'fat', label: 'Fat', unit: 'g', indicatorClassName: 'bg-fat' },
  { key: 'fiber', label: 'Fiber', unit: 'g', indicatorClassName: 'bg-fiber' },
]

export const additionalNutrients: Array<{ key: keyof Nutrients; label: string; unit: string }> = [
  { key: 'sugar', label: 'Sugar', unit: 'g' }, { key: 'sodium', label: 'Sodium', unit: 'mg' },
  { key: 'saturatedFat', label: 'Saturated fat', unit: 'g' }, { key: 'cholesterol', label: 'Cholesterol', unit: 'mg' },
  { key: 'potassium', label: 'Potassium', unit: 'mg' }, { key: 'calcium', label: 'Calcium', unit: 'mg' },
  { key: 'iron', label: 'Iron', unit: 'mg' },
]
