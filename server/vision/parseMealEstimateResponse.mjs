import { nutrientSchema } from './nutrientSchema.mjs'
import { normalizeBoundedText } from './normalizeBoundedText.mjs'
import { validateSources } from './sourceValidation.mjs'

const nutrientNames = Object.keys(nutrientSchema.properties)
const exactKeys = (value, keys) => value && typeof value === 'object' && !Array.isArray(value)
  && Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key))
const validText = value => typeof value === 'string'
const caloriesReconcile = (left, right) => Math.abs(left - right) <= 1
const noWebReasonPattern = /\b(because|since|unavailable|not available|could not|couldn't|no identifiable|not identifiable|no public|not found|generic|homemade)\b/i

function validNutrients(value) {
  return exactKeys(value, nutrientNames) && nutrientNames.every(name => Number.isFinite(value[name]) && value[name] >= 0)
}

export function isMealEstimate(value) {
  const rootKeys = ['mealName', 'confidence', 'summary', 'assumptions', 'calorieBreakdown', 'researchDisclosure', 'items', 'totals']
  const itemKeys = ['name', 'description', 'portion', 'nutrients']
  const componentKeys = ['name', 'portion', 'calories', 'evidence']
  if (!exactKeys(value, rootKeys) || !validText(value.mealName) || !validText(value.summary)) return false
  if (!['low', 'medium', 'high'].includes(value.confidence)) return false
  if (!Array.isArray(value.assumptions) || value.assumptions.length > 20 || !value.assumptions.every(validText)) return false
  if (!exactKeys(value.calorieBreakdown, ['explanation', 'components']) || !validText(value.calorieBreakdown.explanation)) return false
  if (!Array.isArray(value.calorieBreakdown.components) || value.calorieBreakdown.components.length < 1 || value.calorieBreakdown.components.length > 16) return false
  if (!value.calorieBreakdown.components.every(component => exactKeys(component, componentKeys) && validText(component.name)
    && validText(component.portion) && Number.isFinite(component.calories) && component.calories >= 0 && validText(component.evidence))) return false
  if (!exactKeys(value.researchDisclosure, ['internetUsed', 'summary', 'sources'])
    || typeof value.researchDisclosure.internetUsed !== 'boolean' || !validText(value.researchDisclosure.summary)) return false
  const sources = validateSources(value.researchDisclosure.sources)
  if (!sources || (value.researchDisclosure.internetUsed && sources.length === 0)
    || (!value.researchDisclosure.internetUsed && (sources.length > 0 || !noWebReasonPattern.test(value.researchDisclosure.summary)))) return false
  if (!Array.isArray(value.items) || value.items.length !== 1) return false
  const item = value.items[0]
  const componentCalories = value.calorieBreakdown.components.reduce((sum, component) => sum + component.calories, 0)
  return exactKeys(item, itemKeys) && validText(item.name) && validText(item.description) && validText(item.portion)
    && validNutrients(item.nutrients) && validNutrients(value.totals) && caloriesReconcile(componentCalories, item.nutrients.calories)
    && caloriesReconcile(item.nutrients.calories, value.totals.calories)
}

function sanitizeEstimate(estimate) {
  const text = (value, limit) => normalizeBoundedText(value, limit)
  const sanitized = {
    ...estimate,
    mealName: text(estimate.mealName, 500),
    summary: text(estimate.summary, 2_000),
    assumptions: estimate.assumptions.map(value => text(value, 500)),
    calorieBreakdown: {
      explanation: text(estimate.calorieBreakdown.explanation, 2_000),
      components: estimate.calorieBreakdown.components.map(component => ({
        ...component,
        name: text(component.name, 200),
        portion: text(component.portion, 200),
        evidence: text(component.evidence, 500),
      })),
    },
    researchDisclosure: { ...estimate.researchDisclosure, summary: text(estimate.researchDisclosure.summary, 500), sources: validateSources(estimate.researchDisclosure.sources) },
    items: estimate.items.map(item => ({
      ...item,
      name: text(item.name, 200),
      description: text(item.description, 1_000),
      portion: text(item.portion, 200),
    })),
  }
  const required = [sanitized.mealName, sanitized.summary, sanitized.calorieBreakdown.explanation, sanitized.researchDisclosure.summary, ...sanitized.assumptions]
  sanitized.calorieBreakdown.components.forEach(component => required.push(component.name, component.portion, component.evidence))
  sanitized.items.forEach(item => required.push(item.name, item.description, item.portion))
  if (required.some(value => !value)) throw new Error()
  return sanitized
}

export function parseMealEstimateResponse(output) {
  try {
    const estimate = JSON.parse(String(output).trim())
    if (!isMealEstimate(estimate)) throw new Error()
    return sanitizeEstimate(estimate)
  } catch {
    throw Object.assign(new Error('OpenClaw returned an invalid nutrition estimate.'), { statusCode: 502 })
  }
}
