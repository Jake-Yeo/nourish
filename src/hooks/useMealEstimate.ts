import { useState } from 'react'
import { clearPhotoDraft } from '../services/photoDraft/clearPhotoDraft'
import type { Food, MealType, Nutrients } from '../types'
import { createEmptyNutrients } from '../lib/nutrition/createEmptyNutrients'
import type { CapturedPhoto, MealEstimate, PhotoMealStep } from '../types/photoMeal'

export function useMealEstimate(onLog: (foods: Food[], mealType: MealType) => void) {
  const [activeStep, setActiveStep] = useState<PhotoMealStep>('capture')
  const [mealEstimate, setMealEstimate] = useState<MealEstimate | null>(null)
  const [analysisError, setAnalysisError] = useState('')

  const analyzeMealPhotos = async (capturedPhotos: CapturedPhoto[], mealNote: string) => {
    if (!capturedPhotos.length) return setAnalysisError('Add at least one photo of your meal.')
    setActiveStep('analyzing')
    setAnalysisError('')
    try {
      const analysisResponse = await fetch('/api/analyze-meal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ photos: capturedPhotos, note: mealNote }) })
      const analysisResult = await analysisResponse.json()
      if (!analysisResponse.ok) throw new Error(analysisResult.error || 'Analysis failed.')
      setMealEstimate(analysisResult)
      setActiveStep('review')
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : 'Analysis failed.')
      setActiveStep('capture')
    }
  }

  const updateEstimatedItem = (itemIndex: number, fieldName: 'name' | 'portion', value: string) => setMealEstimate(currentEstimate => currentEstimate ? { ...currentEstimate, items: currentEstimate.items.map((item, index) => index === itemIndex ? { ...item, [fieldName]: value } : item) } : null)
  const updateEstimatedNutrient = (itemIndex: number, nutrientName: keyof Nutrients, value: number) => setMealEstimate(currentEstimate => {
    if (!currentEstimate) return null
    const items = currentEstimate.items.map((item, index) => index === itemIndex ? { ...item, nutrients: { ...item.nutrients, [nutrientName]: value } } : item)
    const totals = items.reduce((sum, item) => { for (const name of Object.keys(sum) as Array<keyof Nutrients>) sum[name] += item.nutrients[name]; return sum }, createEmptyNutrients())
    return { ...currentEstimate, items, totals }
  })
  const logEstimatedMeal = (mealType: MealType) => {
    if (!mealEstimate) return
    const foods = mealEstimate.items.map((item): Food => ({ id: `photo-${crypto.randomUUID()}`, name: item.name, brand: `AI estimate · ${mealEstimate.confidence} confidence`, servingLabel: item.portion, servingGrams: 0, nutrients: item.nutrients, source: 'custom' }))
    clearPhotoDraft().catch(() => undefined)
    onLog(foods, mealType)
  }
  return { activeStep, analysisError, analyzeMealPhotos, logEstimatedMeal, mealEstimate, setActiveStep, updateEstimatedItem, updateEstimatedNutrient }
}
