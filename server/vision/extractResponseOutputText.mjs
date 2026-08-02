export function extractResponseOutputText(responsePayload) {
  return responsePayload.output_text || responsePayload.output?.flatMap(outputItem => outputItem.content || []).find(contentItem => contentItem.type === 'output_text')?.text
}
