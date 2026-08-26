function responseError() {
  return Object.assign(new Error('Hermes meal analysis returned an invalid response.'), { statusCode: 502 })
}

export function parseHermesAgentResponse(output) {
  const visibleText = String(output).trim()
  if (visibleText) return visibleText
  throw responseError()
}
