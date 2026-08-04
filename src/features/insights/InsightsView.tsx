import { useState } from 'react'
import { MessageCircleQuestion } from 'lucide-react'
import type { AppData } from '../../types'
import { Button } from '../../components/ui/Button'
import { getDailyNutrition } from './getDailyNutrition'
import { CalorieTrendCard } from './CalorieTrendCard'
import { FiberTipCard } from './FiberTipCard'
import { NutrientReportCard } from './NutrientReportCard'
import { DayQuestionModal } from './DayQuestionModal'

export function InsightsView({ endingDateKey, nutritionData }: { endingDateKey: string; nutritionData: AppData }) {
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false)
  const selectedDayNutrients = getDailyNutrition(nutritionData, endingDateKey, 1)[0].totalNutrients
  return <>
    <Button variant="secondary" fullWidth onClick={() => setIsQuestionModalOpen(true)}><MessageCircleQuestion />Ask about this day</Button>
    <CalorieTrendCard endingDateKey={endingDateKey} nutritionData={nutritionData} />
    <NutrientReportCard goals={nutritionData.goals} nutrients={selectedDayNutrients} />
    <FiberTipCard goals={nutritionData.goals} nutrients={selectedDayNutrients} />
    {isQuestionModalOpen && <DayQuestionModal dateKey={endingDateKey} onClose={() => setIsQuestionModalOpen(false)} />}
  </>
}
