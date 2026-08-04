import { buildMealAnalysisContent } from '../../vision/buildMealAnalysisContent.mjs'
import { requestMealEstimate } from '../../vision/requestMealEstimate.mjs'

export async function analyzeMeal(request, response) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return response.status(503).json({ error: 'AI meal analysis is not configured yet. Add OPENAI_API_KEY to the Nourish launch environment.' })
  const photos = Array.isArray(request.body?.photos) ? request.body.photos : []
  if (!photos.length) return response.status(400).json({ error: 'Add at least one meal photo.' })
  if (photos.length > 12) return response.status(400).json({ error: 'You can add up to 12 meal photos.' })
  if (photos.some(photo => !/^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(String(photo?.dataUrl || '')))) return response.status(400).json({ error: 'One or more meal photos are invalid.' })
  if (photos.some(photo => String(photo?.dataUrl || '').length > 5_500_000) || photos.reduce((total, photo) => total + String(photo?.dataUrl || '').length, 0) > 28_000_000) return response.status(413).json({ error: 'Those photos are too large. Choose fewer or smaller photos.' })
  try {
    response.json(await requestMealEstimate(apiKey, buildMealAnalysisContent(photos, request.body?.note)))
  } catch (error) {
    response.status(Number(error?.statusCode) || 500).json({ error: error instanceof Error ? error.message : 'Meal analysis failed.' })
  }
}
