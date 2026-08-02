export const nutrientSchema = {
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
