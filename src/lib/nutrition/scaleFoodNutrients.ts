import type { Food, Nutrients } from '../../types'

export function scaleFoodNutrients(food: Food, servings: number) {
  return Object.fromEntries(Object.entries(food.nutrients).map(([nutrientName, nutrientValue]) => [nutrientName, nutrientValue * servings])) as Nutrients
}
