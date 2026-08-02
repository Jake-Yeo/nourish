import { normalizeMealType } from './normalizeMealType.mjs'
import { parseMyNetDiaryDate } from './parseMyNetDiaryDate.mjs'
import { parseNumericValue } from './parseNumericValue.mjs'

export function createMyNetDiaryEntry(workbookRow, occurrenceNumber) {
  const parsedDate = parseMyNetDiaryDate(workbookRow['Date & Time'])
  if (!parsedDate || !workbookRow.Name) return null
  const baseIdentifier = [parsedDate.date, workbookRow['Date & Time'], workbookRow.Meal, workbookRow['Food ID'], workbookRow.Amount].join('|')
  const externalIdentifier = `${baseIdentifier}|${occurrenceNumber}`
  const servingLabel = String(workbookRow.Amount || '1 serving')
  const servingGrams = Number(servingLabel.match(/([\d.]+)\s*g\b/i)?.[1] || 0)
  const nutrients = {
    calories: parseNumericValue(workbookRow['Calories, cals']), protein: parseNumericValue(workbookRow['Protein, g']),
    carbs: parseNumericValue(workbookRow['Total Carbs, g']), fat: parseNumericValue(workbookRow['Total Fat, g']),
    fiber: parseNumericValue(workbookRow['Dietary Fiber, g']), sugar: parseNumericValue(workbookRow['Total Sugars, g']),
    sodium: parseNumericValue(workbookRow['Sodium, mg']), saturatedFat: parseNumericValue(workbookRow['Saturated Fat, g']),
    cholesterol: parseNumericValue(workbookRow['Cholesterol, mg']), potassium: parseNumericValue(workbookRow['Potassium, mg']),
    calcium: parseNumericValue(workbookRow['Calcium, mg']), iron: parseNumericValue(workbookRow['Iron, mg']),
  }
  return {
    id: `mynetdiary-${Buffer.from(externalIdentifier).toString('base64url')}`, date: parsedDate.date,
    meal: normalizeMealType(workbookRow.Meal), servings: 1, loggedAt: parsedDate.timestamp, source: 'mynetdiary', externalId: externalIdentifier,
    food: { id: `mynetdiary-food-${workbookRow['Food ID'] || Buffer.from(String(workbookRow.Name)).toString('base64url')}`, name: String(workbookRow.Name), servingLabel, servingGrams, nutrients, source: 'custom' },
  }
}
