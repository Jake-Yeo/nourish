import assert from 'node:assert/strict'
import test from 'node:test'
import { getWeeklyNutritionSummary } from '../src/features/insights/getWeeklyNutritionSummary.ts'

const week = [
  { dateKey: '2026-08-03', totalNutrients: { calories: 2000, protein: 120 } },
  { dateKey: '2026-08-04', totalNutrients: { calories: 1800, protein: 100 } },
  { dateKey: '2026-08-05', totalNutrients: { calories: 1600, protein: 80 } },
  { dateKey: '2026-08-06', totalNutrients: { calories: 1400, protein: 60 } },
  { dateKey: '2026-08-07', totalNutrients: { calories: 1200, protein: 40 } },
  { dateKey: '2026-08-08', totalNutrients: { calories: 3000, protein: 200 } },
  { dateKey: '2026-08-09', totalNutrients: { calories: 3000, protein: 200 } },
]

test('current week averages exclude days after endingDateKey', () => {
  assert.deepEqual(getWeeklyNutritionSummary(week, '2026-08-07'), {
    averageCalories: 1600,
    averageProtein: 80,
  })
})

test('historical week averages include all seven days including zero totals', () => {
  const historicalWeek = week.map((day, index) => index < 2 ? day : {
    ...day,
    totalNutrients: { calories: 0, protein: 0 },
  })
  assert.deepEqual(getWeeklyNutritionSummary(historicalWeek, '2026-08-09'), {
    averageCalories: 543,
    averageProtein: 31,
  })
})
