import { emptyNutrients, type Food } from './types'

type OffProduct = {
  code?: string
  product_name?: string
  brands?: string
  serving_size?: string
  serving_quantity?: number
  image_front_small_url?: string
  nutriments?: Record<string, number>
}

const amount = (nutriments: Record<string, number>, key: string, grams: number) => {
  const serving = nutriments[`${key}_serving`]
  if (Number.isFinite(serving)) return serving
  const per100 = nutriments[`${key}_100g`]
  return Number.isFinite(per100) ? per100 * grams / 100 : 0
}

export async function lookupBarcode(code: string): Promise<Food> {
  const fields = 'code,product_name,brands,serving_size,serving_quantity,image_front_small_url,nutriments'
  const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?fields=${fields}`)
  if (!response.ok) throw new Error('Food database is unavailable right now.')
  const payload = await response.json()
  if (payload.status !== 1 || !payload.product?.product_name) throw new Error('No food found for that barcode. You can add it as a custom food.')
  const product = payload.product as OffProduct
  const n = product.nutriments || {}
  const grams = Number(product.serving_quantity) || 100
  const nutrients = emptyNutrients()
  nutrients.calories = amount(n, 'energy-kcal', grams)
  nutrients.protein = amount(n, 'proteins', grams)
  nutrients.carbs = amount(n, 'carbohydrates', grams)
  nutrients.fat = amount(n, 'fat', grams)
  nutrients.fiber = amount(n, 'fiber', grams)
  nutrients.sugar = amount(n, 'sugars', grams)
  nutrients.sodium = amount(n, 'sodium', grams) * 1000
  nutrients.saturatedFat = amount(n, 'saturated-fat', grams)
  nutrients.cholesterol = amount(n, 'cholesterol', grams) * 1000
  nutrients.potassium = amount(n, 'potassium', grams) * 1000
  nutrients.calcium = amount(n, 'calcium', grams) * 1000
  nutrients.iron = amount(n, 'iron', grams) * 1000

  return {
    id: `off-${product.code || code}`,
    barcode: product.code || code,
    name: product.product_name || 'Scanned food',
    brand: product.brands?.split(',')[0],
    servingLabel: product.serving_size || `${Math.round(grams)} g`,
    servingGrams: grams,
    image: product.image_front_small_url,
    nutrients,
    source: 'openfoodfacts',
  }
}
