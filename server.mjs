import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

if (process.env.NOURISH_ENV_FILE) dotenv.config({ path: process.env.NOURISH_ENV_FILE, quiet: true })

const app = express()
const port = Number(process.env.PORT || 4174)
const root = path.dirname(fileURLToPath(import.meta.url))

app.use(express.json({ limit: '36mb' }))

const nutrientSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    calories: { type: 'number' }, protein: { type: 'number' }, carbs: { type: 'number' },
    fat: { type: 'number' }, fiber: { type: 'number' }, sugar: { type: 'number' },
    sodium: { type: 'number' }, saturatedFat: { type: 'number' }, cholesterol: { type: 'number' },
    potassium: { type: 'number' }, calcium: { type: 'number' }, iron: { type: 'number' },
  },
  required: ['calories', 'protein', 'carbs', 'fat', 'fiber', 'sugar', 'sodium', 'saturatedFat', 'cholesterol', 'potassium', 'calcium', 'iron'],
}

app.get('/api/health', (_request, response) => {
  response.json({ ok: true, visionConfigured: Boolean(process.env.OPENAI_API_KEY), model: process.env.OPENAI_VISION_MODEL || 'gpt-5.6-luna' })
})

app.post('/api/analyze-meal', async (request, response) => {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return response.status(503).json({ error: 'AI meal analysis is not configured yet. Add OPENAI_API_KEY to the Nourish launch environment.' })
  const photos = Array.isArray(request.body?.photos) ? request.body.photos.slice(0, 6) : []
  if (!photos.length) return response.status(400).json({ error: 'Add at least one meal photo.' })
  const content = [{
    type: 'input_text',
    text: `Estimate this meal for a nutrition diary. Analyze all photos as different views or components of ONE meal, not separate meals. Use the user's notes to resolve portion size, ingredients, meat cut, sauces, preparation, and whether an item was fully eaten. Avoid double counting food visible in multiple angles. Give realistic point estimates, not ranges. Be conservative about visual certainty and explicitly mention important assumptions. Overall meal note: ${String(request.body?.note || 'None')}`,
  }]
  photos.forEach((photo, index) => {
    content.push({ type: 'input_text', text: `Photo ${index + 1} note: ${String(photo.note || 'No note')}` })
    content.push({ type: 'input_image', image_url: String(photo.dataUrl), detail: 'high' })
  })

  try {
    const apiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.OPENAI_VISION_MODEL || 'gpt-5.6-luna',
        reasoning: { effort: 'low' },
        input: [{ role: 'user', content }],
        text: {
          format: {
            type: 'json_schema', name: 'meal_nutrition_estimate', strict: true,
            schema: {
              type: 'object', additionalProperties: false,
              properties: {
                mealName: { type: 'string' },
                confidence: { type: 'string', enum: ['low', 'medium', 'high'] },
                summary: { type: 'string' }, assumptions: { type: 'array', items: { type: 'string' } },
                items: {
                  type: 'array', minItems: 1,
                  items: {
                    type: 'object', additionalProperties: false,
                    properties: { name: { type: 'string' }, portion: { type: 'string' }, nutrients: nutrientSchema },
                    required: ['name', 'portion', 'nutrients'],
                  },
                },
                totals: nutrientSchema,
              },
              required: ['mealName', 'confidence', 'summary', 'assumptions', 'items', 'totals'],
            },
          },
        },
      }),
    })
    const payload = await apiResponse.json()
    if (!apiResponse.ok) return response.status(apiResponse.status).json({ error: payload?.error?.message || 'OpenAI could not analyze the meal.' })
    const outputText = payload.output_text || payload.output?.flatMap(item => item.content || []).find(item => item.type === 'output_text')?.text
    if (!outputText) throw new Error('The model returned no nutrition estimate.')
    response.json(JSON.parse(outputText))
  } catch (error) {
    response.status(500).json({ error: error instanceof Error ? error.message : 'Meal analysis failed.' })
  }
})

app.use(express.static(path.join(root, 'dist'), { maxAge: '1h' }))
app.get('*path', (_request, response) => response.sendFile(path.join(root, 'dist', 'index.html')))
app.listen(port, '127.0.0.1', () => console.log(`Nourish running at http://127.0.0.1:${port}`))
