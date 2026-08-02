export function isValidAppData(value) {
  return Boolean(value && typeof value === 'object' && Array.isArray(value.entries) && value.goals && typeof value.goals === 'object')
}
