import { Camera, Sparkles } from 'lucide-react'
import type { DiaryEntry, Goals } from '../../types'
import { getTotalNutrients } from '../../lib/nutrition/getTotalNutrients'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { CalorieProgressRing } from '../../components/nutrition/CalorieProgressRing'
import { Card } from '../../components/ui/Card'
import { Typography } from '../../components/ui/Typography'

type DailySummaryCardProps = { entries: DiaryEntry[]; goals: Goals; onPhotoMeal: () => void; onQuickAdd: () => void }

export function DailySummaryCard({ entries, goals, onPhotoMeal, onQuickAdd }: DailySummaryCardProps) {
  const totalNutrients = getTotalNutrients(entries)
  const loggedMealCount = new Set(entries.map(entry => entry.meal)).size
  const calorieCompletionPercentage = Math.round(totalNutrients.calories / goals.calories * 100)

  return <Card padding="large" className="grid grid-cols-dashboard-summary gap-control-wide overflow-hidden compact:grid-cols-dashboard-summary-wide compact:gap-card">
    <div className="self-center">
      <Badge><Sparkles className="w-4" />Daily plan</Badge>
      <Typography as="h2" variant="sectionTitle" className="mt-control-wide max-w-xs">{entries.length ? `${calorieCompletionPercentage}% of your calorie goal` : 'Ready when you are'}</Typography>
      <Typography variant="muted" className="mt-control">{entries.length ? `${loggedMealCount} meal${loggedMealCount === 1 ? '' : 's'} logged today` : 'Log your first meal to start the day.'}</Typography>
    </div>
    <CalorieProgressRing caloriesConsumed={totalNutrients.calories} calorieGoal={goals.calories} />
    <div className="col-span-full flex items-center justify-around rounded-sheet bg-canvas p-content">
      <div className="flex flex-col items-center"><strong className="text-xl">{Math.round(totalNutrients.calories).toLocaleString()}</strong><Typography variant="caption">Food</Typography></div>
      <Typography variant="caption" className="font-bold">of</Typography>
      <div className="flex flex-col items-center"><strong className="text-xl">{goals.calories.toLocaleString()}</strong><Typography variant="caption">Daily goal</Typography></div>
    </div>
    <Button fullWidth className="col-span-full bg-linear-to-br from-primary to-fiber" onClick={() => onPhotoMeal()}><Camera className="w-5" />Photograph meal</Button>
    <Button variant="ghost" className="col-span-full" onClick={() => onQuickAdd()}>Add a correction manually</Button>
  </Card>
}
