export function getTodayDateKey() {
  return new Date().toISOString().slice(0, 10)
}
