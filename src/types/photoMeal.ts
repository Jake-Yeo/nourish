import type { AiPhotoExplanation, CalorieBreakdown, Nutrients } from '../types'

export type CapturedPhoto = { id: string; dataUrl: string; note: string }
export type CaptureFoodItem = { id: string; name: string; description: string; photos: CapturedPhoto[] }
export type ResearchSource = { title: string; url?: string }
export type MealEstimateItem = { groupId: string; name: string; description: string; portion: string; nutrients: Nutrients; sources?: ResearchSource[] }
export type MealEstimate = {
  mealName: string
  confidence: 'low' | 'medium' | 'high'
  summary: string
  assumptions: string[]
  calorieBreakdown?: CalorieBreakdown
  researchDisclosure: { internetUsed: boolean; summary: string; sources: ResearchSource[] }
  items: MealEstimateItem[]
  totals: Nutrients
}

export type MealEstimateExplanation = Pick<AiPhotoExplanation, 'confidence' | 'summary' | 'assumptions' | 'calorieBreakdown'>
export type PhotoMealStep = 'capture' | 'analyzing' | 'review'
export type MealAnalysisStatus = 'queued' | 'running' | 'completed' | 'failed' | 'interrupted'
export type MealAnalysisSource = { items: CaptureFoodItem[]; note: string; mealType: import('../types').MealType; date: string; replacement?: { mealId: string; itemId: string; entryId: string } }
export type MealAnalysisJob = { id: string; status: MealAnalysisStatus; source: MealAnalysisSource; result: MealEstimate | null; error: string | null; attempt: number; createdAt: number; startedAt: number | null; finishedAt: number | null; updatedAt: number; loggedAt: number | null; loggedMealId: string | null; diaryUpdatePending: boolean }
