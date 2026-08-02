import { buildMealAnalysisContent } from '../../vision/buildMealAnalysisContent.mjs'
import { requestMealEstimate } from '../../vision/requestMealEstimate.mjs'

export async function analyzeMeal(request, response) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return response.status(503).json({ error: 'AI meal analysis is not configured yet. Add OPENAI_API_KEY to the Nourish launch environment.' })
  const photos = Array.isArray(request.body?.photos) ? request.body.photos.slice(0, 6) : []
  if (!photos.length) return response.status(400).json({ error: 'Add at least one meal photo.' })
  try {
    response.json(await requestMealEstimate(apiKey, buildMealAnalysisContent(photos, request.body?.note)))
  } catch (error) {
    response.status(Number(error?.statusCode) || 500).json({ error: error instanceof Error ? error.message : 'Meal analysis failed.' })
  }
}
