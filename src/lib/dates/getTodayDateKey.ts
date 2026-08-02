import { getDateKey } from './getDateKey'

export function getTodayDateKey() {
  return getDateKey(new Date())
}
