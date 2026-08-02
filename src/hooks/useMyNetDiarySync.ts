import { useState } from 'react'
import type { DataMutation } from '../services/nutritionData/DataMutation'
import type { DiaryEntry } from '../types'

export function useMyNetDiarySync(commitNutritionMutation: (mutation: DataMutation) => Promise<boolean>, showToast: (message: string) => void) {
  const [isSyncing, setIsSyncing] = useState(false)

  const synchronizeMyNetDiary = async () => {
    setIsSyncing(true)
    try {
      const syncResponse = await fetch('/api/sync-mynetdiary', { method: 'POST' })
      const syncResult = await syncResponse.json()
      if (!syncResponse.ok) throw new Error(syncResult.error || 'MyNetDiary sync failed.')
      const importedEntries = syncResult.entries as DiaryEntry[]
      const importedYears = new Set<string>([String(syncResult.exportYear), ...importedEntries.map(entry => entry.date.slice(0, 4))])
      const saved = await commitNutritionMutation({ type: 'replaceMyNetDiary', entries: importedEntries, years: [...importedYears], syncedAt: Date.now() })
      if (saved) showToast(`Downloaded and synced ${importedEntries.length} MyNetDiary food entries`)
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'MyNetDiary sync failed.')
    } finally {
      setIsSyncing(false)
    }
  }

  return { isSyncing, synchronizeMyNetDiary }
}
