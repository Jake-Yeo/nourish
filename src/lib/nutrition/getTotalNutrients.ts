import type { DiaryEntry, Nutrients } from '../../types'
import { createEmptyNutrients } from './createEmptyNutrients'
import { scaleFoodNutrients } from './scaleFoodNutrients'

export function getTotalNutrients(entries: DiaryEntry[]) {
  return entries.reduce((totalNutrients, diaryEntry) => {
    const scaledNutrients = scaleFoodNutrients(diaryEntry.food, diaryEntry.servings)
    for (const nutrientName of Object.keys(totalNutrients) as Array<keyof Nutrients>) totalNutrients[nutrientName] += scaledNutrients[nutrientName]
    return totalNutrients
  }, createEmptyNutrients())
}
