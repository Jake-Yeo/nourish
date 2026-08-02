import { getDateKey } from './getDateKey'
import { getTodayDateKey } from './getTodayDateKey'

export function getFriendlyDate(dateKey: string) {
  if (dateKey === getTodayDateKey()) return 'Today'
  const tomorrow = new Date()
  const yesterday = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  yesterday.setDate(yesterday.getDate() - 1)
  if (dateKey === getDateKey(yesterday)) return 'Yesterday'
  if (dateKey === getDateKey(tomorrow)) return 'Tomorrow'
  return new Date(`${dateKey}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}
