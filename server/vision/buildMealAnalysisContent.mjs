export function buildMealAnalysisContent(photos, overallMealNote) {
  const analysisContent = [{
    type: 'input_text',
    text: `Estimate this meal for a nutrition diary. Analyze all photos as different views or components of ONE meal, not separate meals. Use the user's notes to resolve portion size, ingredients, meat cut, sauces, preparation, and whether an item was fully eaten. Avoid double counting food visible in multiple angles. Give realistic point estimates, not ranges. Be conservative about visual certainty and explicitly mention important assumptions. Overall meal note: ${String(overallMealNote || 'None')}`,
  }]
  photos.forEach((photo, photoIndex) => {
    analysisContent.push({ type: 'input_text', text: `Photo ${photoIndex + 1} note: ${String(photo.note || 'No note')}` })
    analysisContent.push({ type: 'input_image', image_url: String(photo.dataUrl), detail: 'high' })
  })
  return analysisContent
}
