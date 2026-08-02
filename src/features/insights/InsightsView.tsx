import type { AppData } from '../../types'
import { getDailyNutrition } from './getDailyNutrition'
import { CalorieTrendCard } from './CalorieTrendCard'
import { FiberTipCard } from './FiberTipCard'
import { NutrientReportCard } from './NutrientReportCard'

export function InsightsView({ endingDateKey, nutritionData }: { endingDateKey: string; nutritionData: AppData }) {
  const selectedDayNutrients = getDailyNutrition(nutritionData, endingDateKey, 1)[0].totalNutrients
  return <>
    <CalorieTrendCard endingDateKey={endingDateKey} nutritionData={nutritionData} />
    <NutrientReportCard goals={nutritionData.goals} nutrients={selectedDayNutrients} />
    <FiberTipCard goals={nutritionData.goals} nutrients={selectedDayNutrients} />
  </>
}
