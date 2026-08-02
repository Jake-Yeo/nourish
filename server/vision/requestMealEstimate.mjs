import { runtimeConfiguration } from '../config/runtimeConfiguration.mjs'
import { mealEstimateSchema } from './mealEstimateSchema.mjs'
import { extractResponseOutputText } from './extractResponseOutputText.mjs'

export async function requestMealEstimate(apiKey, analysisContent) {
  const apiResponse = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: runtimeConfiguration.visionModel, reasoning: { effort: 'low' }, input: [{ role: 'user', content: analysisContent }],
      text: { format: { type: 'json_schema', name: 'meal_nutrition_estimate', strict: true, schema: mealEstimateSchema } },
    }),
  })
  const responsePayload = await apiResponse.json()
  if (!apiResponse.ok) {
    const error = new Error(responsePayload?.error?.message || 'OpenAI could not analyze the meal.')
    error.statusCode = apiResponse.status
    throw error
  }
  const outputText = extractResponseOutputText(responsePayload)
  if (!outputText) throw new Error('The model returned no nutrition estimate.')
  return JSON.parse(outputText)
}
