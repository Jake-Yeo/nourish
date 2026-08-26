function responseError() {
  return Object.assign(new Error('OpenClaw meal analysis returned an invalid response.'), { statusCode: 502 })
}

export function parseOpenClawAgentResponse(output) {
  try {
    const envelope = JSON.parse(String(output).trim())
    if (envelope?.status !== 'ok') throw responseError()
    const visibleText = envelope?.result?.finalAssistantVisibleText
    if (typeof visibleText === 'string' && visibleText.trim()) return visibleText
    const payloads = envelope?.result?.payloads
    const texts = Array.isArray(payloads) ? payloads.map(payload => payload?.text).filter(text => typeof text === 'string' && text.trim()) : []
    if (texts.length === 1) return texts[0]
  } catch (error) {
    if (error?.statusCode) throw error
  }
  throw responseError()
}
