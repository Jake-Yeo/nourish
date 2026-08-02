import type { Nutrients } from '../../types'

const nutrientIndicatorClasses: Partial<Record<keyof Nutrients, string>> = {
  protein: 'bg-protein', carbs: 'bg-carbs', fat: 'bg-fat', fiber: 'bg-fiber',
}

export function getNutrientIndicatorClassName(nutrientName: keyof Nutrients) {
  return nutrientIndicatorClasses[nutrientName] || 'bg-primary'
}
