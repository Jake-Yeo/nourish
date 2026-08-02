import type { Goals, Nutrients } from '../../types'
import { getFriendlyDate } from '../../lib/dates/getFriendlyDate'

type DailyNutrition = { dateKey: string; totalNutrients: Nutrients }

export function CalorieTrendChart({ dailyNutrition, goals }: { dailyNutrition: DailyNutrition[]; goals: Goals }) {
  const dayCount = dailyNutrition.length
  return <div className="flex h-36 items-end justify-around gap-control pt-control-wide">
    {dailyNutrition.map(({ dateKey, totalNutrients }, dayIndex) => {
      const heightPercentage = Math.max(4, Math.min(totalNutrients.calories / goals.calories * 100, 100))
      const shouldShowLabel = dayCount <= 14 || dayIndex === 0 || dayIndex === dayCount - 1 || dayIndex % Math.ceil(dayCount / 7) === 0
      return <div className="flex h-full flex-1 flex-col items-center justify-end gap-control" key={dateKey} title={`${getFriendlyDate(dateKey)}: ${Math.round(totalNutrients.calories)} calories`}>
        <span className="min-h-1 w-full max-w-8 rounded-t-control bg-accent" style={{ height: `${heightPercentage}%` }} />
        <small className="text-chart">{shouldShowLabel ? new Date(`${dateKey}T12:00:00`).toLocaleDateString(undefined, { weekday: 'narrow' }) : ''}</small>
      </div>
    })}
  </div>
}
