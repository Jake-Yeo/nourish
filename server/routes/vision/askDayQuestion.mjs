import { buildDayQuestionContent } from '../../vision/buildDayQuestionContent.mjs'
import { requestDayQuestion } from '../../vision/requestDayQuestion.mjs'
import { readAppState } from '../../database/readAppState.mjs'

export async function askDayQuestion(request, response) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return response.status(503).json({ error: 'AI questions are not configured yet. Add OPENAI_API_KEY to the Nourish launch environment.' })
  const question = String(request.body?.question || '').trim().slice(0, 1_000)
  if (!question) return response.status(400).json({ error: 'Ask a question about this day.' })
  const dateKey = String(request.body?.dateKey || '')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return response.status(400).json({ error: 'Choose a valid diary day.' })
  const applicationState = readAppState()?.data
  if (!applicationState) return response.status(409).json({ error: 'Nourish database is not initialized.' })
  const entries = applicationState.entries.filter(entry => entry?.date === dateKey).slice(0, 100)
  try {
    const answer = await requestDayQuestion(apiKey, buildDayQuestionContent(dateKey, entries, applicationState.goals, question))
    response.json({ answer })
  } catch (error) {
    response.status(Number(error?.statusCode) || 500).json({ error: error instanceof Error ? error.message : 'Could not answer the day question.' })
  }
}
