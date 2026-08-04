import { runtimeConfiguration } from '../config/runtimeConfiguration.mjs'
import { extractResponseOutputText } from './extractResponseOutputText.mjs'

export async function requestDayQuestion(apiKey, content) {
  const abortController = new AbortController()
  const timeout = setTimeout(() => abortController.abort(), 30_000)
  try {
    const apiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: runtimeConfiguration.visionModel, reasoning: { effort: 'low' }, max_output_tokens: 800, store: false, input: [{ role: 'user', content }] }),
      signal: abortController.signal,
    })
    const responsePayload = await apiResponse.json()
    if (!apiResponse.ok) {
      const error = new Error(responsePayload?.error?.message || 'OpenAI could not answer the day question.')
      error.statusCode = apiResponse.status
      throw error
    }
    const outputText = extractResponseOutputText(responsePayload)
    if (!outputText) throw new Error('The model returned no answer.')
    return outputText.slice(0, 4_000)
  } finally {
    clearTimeout(timeout)
  }
}
