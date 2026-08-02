export function normalizeMealType(value) {
  const normalizedMealName = String(value).toLowerCase()
  if (normalizedMealName.startsWith('break')) return 'Breakfast'
  if (normalizedMealName.startsWith('lunch')) return 'Lunch'
  if (normalizedMealName.startsWith('dinner') || normalizedMealName.startsWith('supper')) return 'Dinner'
  return 'Snacks'
}
