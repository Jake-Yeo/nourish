type WeeklyHistorySummaryProps = {
  averageCalories: number
  averageProtein: number
  changeLabel: string
}

export function WeeklyHistorySummary({ averageCalories, averageProtein, changeLabel }: WeeklyHistorySummaryProps) {
  return <dl className="mt-control-wide grid grid-cols-2 gap-control rounded-control bg-surface p-control compact:grid-cols-3">
    <div className="col-span-2 rounded-control bg-primary-soft px-control-wide py-control compact:col-span-1">
      <dt className="text-caption font-bold text-primary-strong">Estimated weight</dt>
      <dd className="mt-badge text-body font-extrabold text-primary-strong">{changeLabel}</dd>
    </div>
    <div className="rounded-control bg-canvas px-control-wide py-control">
      <dt className="text-caption font-bold text-muted">Avg calories/day</dt>
      <dd className="mt-badge text-body font-extrabold text-ink">{averageCalories.toLocaleString()} cal</dd>
    </div>
    <div className="rounded-control bg-canvas px-control-wide py-control">
      <dt className="text-caption font-bold text-muted">Avg protein/day</dt>
      <dd className="mt-badge text-body font-extrabold text-ink">{averageProtein.toLocaleString()} g</dd>
    </div>
  </dl>
}
