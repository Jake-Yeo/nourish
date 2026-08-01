import { defaultGoals } from './data'
import type { AppData } from './types'

const KEY = 'nourish-data-v1'

export const initialData: AppData = {
  entries: [],
  goals: defaultGoals,
}

export function loadData(): AppData {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || 'null')
    if (!parsed) return initialData
    return {
      ...initialData,
      ...parsed,
      goals: { ...defaultGoals, ...parsed.goals },
    }
  } catch {
    return initialData
  }
}

export function saveData(data: AppData) {
  localStorage.setItem(KEY, JSON.stringify(data))
}
