import { useEffect, useRef } from 'react'
import type { Goals, Nutrients } from '../../types'
import { getFriendlyDate } from '../../lib/dates/getFriendlyDate'

type DailyNutrition = { dateKey: string; totalNutrients: Nutrients }

export function CalorieTrendChart({ dailyNutrition, goals }: { dailyNutrition: DailyNutrition[]; goals: Goals }) {
  const dayCount = dailyNutrition.length
  const firstDateKey = dailyNutrition[0]?.dateKey
  const latestDateKey = dailyNutrition[dayCount - 1]?.dateKey
  const chartScrollerRef = useRef<HTMLDivElement>(null)
  const maximumCalories = Math.max(goals.calories, ...dailyNutrition.map(day => day.totalNutrients.calories), 1)

  useEffect(() => {
    const chartScroller = chartScrollerRef.current
    if (chartScroller) chartScroller.scrollLeft = chartScroller.scrollWidth
  }, [dayCount, firstDateKey, latestDateKey])

  return <div ref={chartScrollerRef} className="min-w-0 overflow-x-auto" aria-label={`${dayCount}-day calorie trend`}>
    <div className="flex h-36 items-end justify-around gap-control pt-control-wide" style={{ minWidth: `max(100%, ${dayCount * 3.75}rem)` }}>
      {dailyNutrition.map(({ dateKey, totalNutrients }) => {
        const heightPercentage = Math.max(4, totalNutrients.calories / maximumCalories * 100)
        const dateLabel = new Date(`${dateKey}T12:00:00`).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })
        return <div className="flex h-full min-w-12 flex-1 flex-col items-center justify-end gap-control" key={dateKey} title={`${getFriendlyDate(dateKey)}: ${Math.round(totalNutrients.calories)} calories`}>
          <span className="min-h-1 w-full max-w-8 rounded-t-control bg-accent" style={{ height: `${heightPercentage}%` }} />
          <small className="text-chart">{dateLabel}</small>
        </div>
      })}
    </div>
  </div>
}
