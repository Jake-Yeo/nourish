export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks'

export type Nutrients = {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  sugar: number
  sodium: number
  saturatedFat: number
  cholesterol: number
  potassium: number
  calcium: number
  iron: number
}

export type Food = {
  id: string
  name: string
  brand?: string
  servingLabel: string
  servingGrams: number
  image?: string
  barcode?: string
  nutrients: Nutrients
  source?: 'starter' | 'openfoodfacts' | 'custom'
}

export type DiaryEntrySource = 'nourish-photo' | 'nourish-manual' | 'nourish-barcode' | 'mynetdiary'

export type AiPhotoExplanation = {
  confidence: 'low' | 'medium' | 'high'
  summary: string
  assumptions: string[]
}

export type DiaryEntry = {
  id: string
  date: string
  meal: MealType
  food: Food
  servings: number
  loggedAt: number
  source?: DiaryEntrySource
  externalId?: string
  aiPhotoExplanation?: AiPhotoExplanation
}

export type Goals = Nutrients & {
  maintenanceCalories: number
}

export type AppData = {
  entries: DiaryEntry[]
  goals: Goals
  lastMyNetDiarySync?: number
}

export const mealTypes: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snacks']
