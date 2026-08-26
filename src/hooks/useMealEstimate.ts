import { useRef, useState } from 'react'
import type { MealAnalysisJob } from '../types/photoMeal'
import { clearPhotoDraft } from '../services/photoDraft/clearPhotoDraft'
import { rerunAnalysisJob } from '../services/analysisJobs/analysisJobsApi'
import type { MealType } from '../types'
import type { CaptureFoodItem } from '../types/photoMeal'

type Replacement = { mealId: string; itemId: string; entryId: string }
export function useMealEstimate() {
  const [analysisError, setAnalysisError] = useState('')
  const [isQueuing, setIsQueuing] = useState(false)
  const attemptKey = useRef<string | null>(null)
  const pending = useRef(false)
  const queueMealAnalysis = async (items: CaptureFoodItem[], note: string, mealType: MealType, date: string, replacement?: Replacement, analysisJobId?: string) => {
    if (pending.current) return null
    if (!items.length) { setAnalysisError('Add at least one food item.'); return null }
    pending.current = true; setIsQueuing(true); setAnalysisError('')
    try {
      if (analysisJobId) return await rerunAnalysisJob(analysisJobId, { items, note, mealType, date, replacement })
      attemptKey.current ||= crypto.randomUUID()
      const response = await fetch('/api/analyze-meal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items, note, mealType, date, replacement, idempotencyKey: attemptKey.current }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not queue analysis.')
      const job = result as MealAnalysisJob
      attemptKey.current = null
      if (!replacement) await clearPhotoDraft().catch(() => undefined)
      return job
    } catch (error) { setAnalysisError(error instanceof Error ? error.message : 'Could not queue analysis.'); return null }
    finally { pending.current = false; setIsQueuing(false) }
  }
  return { analysisError, isQueuing, queueMealAnalysis }
}
