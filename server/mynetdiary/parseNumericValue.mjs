export function parseNumericValue(value) {
  return Number.isFinite(Number(value)) ? Number(value) : 0
}
