import type { DataMutation } from './DataMutation'
import { requestNutritionData } from './requestNutritionData'

export function mutateNutritionData(dataMutation: DataMutation) {
  return requestNutritionData('/api/data/mutate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dataMutation) })
}
