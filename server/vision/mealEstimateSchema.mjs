import { nutrientSchema } from './nutrientSchema.mjs'

export const mealEstimateSchema = {
  type: 'object', additionalProperties: false,
  properties: {
    mealName: { type: 'string' }, confidence: { type: 'string', enum: ['low', 'medium', 'high'] },
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
}
