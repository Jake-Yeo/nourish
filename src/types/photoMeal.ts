import type { Nutrients } from '../types'

export type CapturedPhoto = { id: string; dataUrl: string; note: string }
export type MealEstimateItem = { name: string; portion: string; nutrients: Nutrients }
export type MealEstimate = {
  mealName: string
  confidence: 'low' | 'medium' | 'high'
  summary: string
  assumptions: string[]
  items: MealEstimateItem[]
  totals: Nutrients
}
export type PhotoMealStep = 'capture' | 'analyzing' | 'review'
