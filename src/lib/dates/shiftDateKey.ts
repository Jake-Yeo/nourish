import { getDateKey } from './getDateKey'

export function shiftDateKey(dateKey: string, dayOffset: number) {
  const shiftedDate = new Date(`${dateKey}T12:00:00`)
  shiftedDate.setDate(shiftedDate.getDate() + dayOffset)
  return getDateKey(shiftedDate)
}
