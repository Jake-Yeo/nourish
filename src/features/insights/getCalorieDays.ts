import type { DiaryEntry } from '../../types'

export function getCalorieDays(entries: DiaryEntry[]) {
  return Object.entries(entries.reduce<Record<string, number>>((days, entry) => {
    days[entry.date] = (days[entry.date] ?? 0) + entry.food.nutrients.calories * entry.servings
    return days
  }, {})).map(([date, calories]) => ({ calories, date }))
}
