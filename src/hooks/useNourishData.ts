import { useEffect, useState } from 'react'
import { bootstrapNutritionData } from '../services/nutritionData/bootstrapNutritionData'
import type { DataMutation } from '../services/nutritionData/DataMutation'
import { fetchNutritionData } from '../services/nutritionData/fetchNutritionData'
import { loadCachedNutritionData } from '../services/nutritionData/loadCachedNutritionData'
import { mutateNutritionData } from '../services/nutritionData/mutateNutritionData'
import type { AppData, DiaryEntry } from '../types'
import type { CaptureFoodItem } from '../types/photoMeal'

export function useNourishData(showToast: (message: string) => void) {
  const [nutritionData, setNutritionData] = useState<AppData>(loadCachedNutritionData)

  useEffect(() => {
    let shouldUpdateState = true
    const refreshNutritionData = () => fetchNutritionData().then(remoteData => {
      if (shouldUpdateState) setNutritionData(remoteData)
    }).catch(() => undefined)
    const refreshWhenVisible = () => { if (document.visibilityState === 'visible') void refreshNutritionData() }

    bootstrapNutritionData().then(remoteData => {
      if (shouldUpdateState) setNutritionData(remoteData)
    }).catch(error => {
      if (shouldUpdateState) showToast(error instanceof Error ? error.message : 'Could not load Nourish data.')
    })

    const refreshInterval = window.setInterval(refreshNutritionData, 10_000)
    window.addEventListener('focus', refreshNutritionData)
    document.addEventListener('visibilitychange', refreshWhenVisible)
    return () => {
      shouldUpdateState = false
      window.clearInterval(refreshInterval)
      window.removeEventListener('focus', refreshNutritionData)
      document.removeEventListener('visibilitychange', refreshWhenVisible)
    }
  }, [showToast])

  const commitNutritionMutation = async (nutritionMutation: DataMutation) => {
    try {
      const remoteData = await mutateNutritionData(nutritionMutation)
      setNutritionData(remoteData)
      return true
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not save Nourish data.')
      return false
    }
  }

  const commitPhotoMeal = async (entries: DiaryEntry[], items: CaptureFoodItem[], mealNote: string, analysisJobId?: string) => {
    try {
      const response = await fetch('/api/photo-meals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mealId: crypto.randomUUID(), analysisJobId, entries, items: items.map((item, index) => ({ ...item, entryId: entries[index]?.id })), mealNote }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not save meal photos.')
      setNutritionData(result.data)
      return true
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not save meal photos.')
      return false
    }
  }

  const commitLoggedPhotoMeal = async (analysisJobId: string, entries: DiaryEntry[], items: CaptureFoodItem[], mealNote: string) => {
    try {
      const response = await fetch(`/api/analysis-jobs/${analysisJobId}/diary`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ entries, items: items.map((item, index) => ({ ...item, entryId: entries[index]?.id })), mealNote }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not update the logged meal.')
      setNutritionData(result.data)
      return true
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not update the logged meal.')
      return false
    }
  }

  return { nutritionData, commitNutritionMutation, commitPhotoMeal, commitLoggedPhotoMeal }
}
