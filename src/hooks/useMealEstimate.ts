import type { MealAnalysisJob } from '../types/photoMeal'
import { useRef, useState } from 'react'
import { clearPhotoDraft } from '../services/photoDraft/clearPhotoDraft'
import type { MealType } from '../types'
import type { CaptureFoodItem } from '../types/photoMeal'

type Replacement = { mealId: string; itemId: string; entryId: string }
export function useMealEstimate() {
  const [analysisError, setAnalysisError] = useState('')
  const [isQueuing, setIsQueuing] = useState(false)
  const attemptKey = useRef<string | null>(null)
  const queueMealAnalysis = async (items: CaptureFoodItem[], note: string, mealType: MealType, date: string, replacement?: Replacement) => {
    if (!items.length) { setAnalysisError('Add at least one food item.'); return false }
    setIsQueuing(true); setAnalysisError('')
    attemptKey.current ||= crypto.randomUUID()
    try {
      const response = await fetch('/api/analyze-meal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items, note, mealType, date, replacement, idempotencyKey: attemptKey.current }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not queue analysis.')
      const job = result as MealAnalysisJob
      attemptKey.current = null; if (!replacement) await clearPhotoDraft(); return job
    } catch (error) { setAnalysisError(error instanceof Error ? error.message : 'Could not queue analysis.'); return null }
    finally { setIsQueuing(false) }
  }
  return { analysisError, isQueuing, queueMealAnalysis }
}
