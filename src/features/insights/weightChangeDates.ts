import { getDateKey } from '../../lib/dates/getDateKey'
import { getTodayDateKey } from '../../lib/dates/getTodayDateKey'
import { shiftDateKey } from '../../lib/dates/shiftDateKey'

export function getDefaultWeightChangeRange() {
  const end = new Date(`${getTodayDateKey()}T12:00:00`)
  const start = new Date(end)
  start.setMonth(start.getMonth() - 2)
  return { endDate: getDateKey(end), startDate: getDateKey(start) }
}

export function getMondayDateKey(dateKey: string) {
  const date = new Date(`${dateKey}T12:00:00`)
  return shiftDateKey(dateKey, -(date.getDay() + 6) % 7)
}

export function getWeekDateRanges(endingDateKey: string, count: number) {
  const latestMonday = getMondayDateKey(endingDateKey)
  return Array.from({ length: count }, (_, index) => {
    const startDate = shiftDateKey(latestMonday, -index * 7)
    return { endDate: shiftDateKey(startDate, 6), startDate }
  })
}

export function formatDateRange(startDate: string, endDate: string) {
  const format = (dateKey: string) => new Date(`${dateKey}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  return `${format(startDate)} – ${format(endDate)}`
}
