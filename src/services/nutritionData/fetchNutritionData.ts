import { requestNutritionData } from './requestNutritionData'

export function fetchNutritionData() {
  return requestNutritionData('/api/data')
}
