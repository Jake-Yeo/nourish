import { nutrientSchema } from './nutrientSchema.mjs'

export const mealEstimateSchema = {
  type: 'object', additionalProperties: false,
  properties: {
    mealName: { type: 'string' }, confidence: { type: 'string', enum: ['low', 'medium', 'high'] },
    summary: { type: 'string' }, assumptions: { type: 'array', maxItems: 20, items: { type: 'string' } },
    calorieBreakdown: {
      type: 'object', additionalProperties: false,
      properties: {
        explanation: { type: 'string', maxLength: 2_000 },
        components: {
          type: 'array', minItems: 1, maxItems: 16,
          items: {
            type: 'object', additionalProperties: false,
            properties: { name: { type: 'string', maxLength: 200 }, portion: { type: 'string', maxLength: 200 }, calories: { type: 'number' }, evidence: { type: 'string', maxLength: 500 } },
            required: ['name', 'portion', 'calories', 'evidence'],
          },
        },
      },
      required: ['explanation', 'components'],
    },
    calorieCalibration: {
      type: 'object', additionalProperties: false,
      properties: { plausibleLow: { type: 'number' }, plausibleHigh: { type: 'number' } },
      required: ['plausibleLow', 'plausibleHigh'],
    },
    researchDisclosure: {
      type: 'object', additionalProperties: false,
      properties: { internetUsed: { type: 'boolean' }, summary: { type: 'string', maxLength: 500 }, sources: { type: 'array', maxItems: 12, items: { type: 'object', additionalProperties: false, properties: { title: { type: 'string', maxLength: 200 }, url: { type: 'string', maxLength: 500 } }, required: ['title'] } } },
      required: ['internetUsed', 'summary', 'sources'],
    },
    items: {
      type: 'array', minItems: 1, maxItems: 1,
      items: {
        type: 'object', additionalProperties: false,
        properties: { name: { type: 'string' }, description: { type: 'string' }, portion: { type: 'string' }, nutrients: nutrientSchema },
        required: ['name', 'description', 'portion', 'nutrients'],
      },
    },
    totals: nutrientSchema,
  },
  required: ['mealName', 'confidence', 'summary', 'assumptions', 'calorieBreakdown', 'calorieCalibration', 'researchDisclosure', 'items', 'totals'],
}
