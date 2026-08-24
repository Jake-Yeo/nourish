import { additionalNutrients } from './nutrients'
import type { Goals } from '../types'

export const goalFields: Array<{ key: keyof Goals; label: string; unit: string; description: string }> = [
  { key: 'calories', label: 'Calories', unit: 'kcal', description: 'Your daily energy budget' },
  { key: 'protein', label: 'Protein', unit: 'g', description: 'Supports muscle and recovery' },
  { key: 'fiber', label: 'Fiber', unit: 'g', description: 'Supports digestion and fullness' },
  { key: 'carbs', label: 'Carbohydrates', unit: 'g', description: 'Your primary energy source' },
  { key: 'fat', label: 'Fat', unit: 'g', description: 'Essential dietary fats' },
  { key: 'maintenanceCalories', label: 'Calorie maintenance', unit: 'kcal', description: 'Used for low-calorie logged days in insights' },
  { key: 'maintenanceAdjustmentThreshold', label: 'Maintenance switch', unit: 'kcal', description: 'Days at or below this use maintenance in calculations' },
  ...additionalNutrients.map(nutrient => ({ ...nutrient, description: `Daily ${nutrient.label.toLowerCase()} target` })),
]
