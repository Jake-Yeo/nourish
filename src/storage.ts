import { defaultGoals } from './data'
import type { AppData, DiaryEntry, Goals } from './types'

const LEGACY_KEY = 'nourish-data-v1'
const CACHE_KEY = 'nourish-data-cache-v2'
const MIGRATION_KEY = 'nourish-sqlite-migration-v1'

export const initialData: AppData = {
  entries: [],
  goals: defaultGoals,
}

const normalizeData = (value: Partial<AppData> | null): AppData => ({
  ...initialData,
  ...value,
  entries: Array.isArray(value?.entries) ? value.entries : [],
  goals: { ...defaultGoals, ...value?.goals },
})

const readLocal = (key: string) => {
  try { return normalizeData(JSON.parse(localStorage.getItem(key) || 'null')) } catch { return null }
}

// This cache only avoids a blank screen during startup. SQLite is authoritative.
export function loadData(): AppData {
  return readLocal(CACHE_KEY) || readLocal(LEGACY_KEY) || initialData
}

const cacheData = (data: AppData) => localStorage.setItem(CACHE_KEY, JSON.stringify(data))

const requestData = async (url: string, init?: RequestInit): Promise<AppData> => {
  const response = await fetch(url, init)
  const payload = await response.json()
  if (!response.ok) throw new Error(payload.error || 'Could not save Nourish data.')
  const data = normalizeData(payload.data)
  cacheData(data)
  return data
}

export async function bootstrapData(): Promise<AppData> {
  const needsMigration = localStorage.getItem(MIGRATION_KEY) !== 'done'
  const legacyData = needsMigration ? readLocal(LEGACY_KEY) : null
  const data = await requestData('/api/data/bootstrap', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ localData: legacyData }),
  })
  localStorage.setItem(MIGRATION_KEY, 'done')
  localStorage.removeItem(LEGACY_KEY)
  return data
}

export function fetchData(): Promise<AppData> {
  return requestData('/api/data')
}

export type DataMutation =
  | { type: 'addEntries'; entries: DiaryEntry[] }
  | { type: 'deleteEntry'; id: string }
  | { type: 'updateGoals'; goals: Goals }
  | { type: 'replaceMyNetDiary'; entries: DiaryEntry[]; years: string[]; syncedAt: number }

export function mutateData(mutation: DataMutation): Promise<AppData> {
  return requestData('/api/data/mutate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mutation),
  })
}
