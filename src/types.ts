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

export type DiaryEntry = {
  id: string
  date: string
  meal: MealType
  food: Food
  servings: number
  loggedAt: number
  source?: 'nourish-photo' | 'nourish-manual' | 'nourish-barcode' | 'mynetdiary'
  externalId?: string
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

export const emptyNutrients = (): Nutrients => ({
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  fiber: 0,
  sugar: 0,
  sodium: 0,
  saturatedFat: 0,
  cholesterol: 0,
  potassium: 0,
  calcium: 0,
  iron: 0,
})
