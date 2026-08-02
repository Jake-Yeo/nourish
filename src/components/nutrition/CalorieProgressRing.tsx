type CalorieProgressRingProps = { caloriesConsumed: number; calorieGoal: number }

export function CalorieProgressRing({ calorieGoal, caloriesConsumed }: CalorieProgressRingProps) {
  const completionPercentage = Math.min(caloriesConsumed / Math.max(calorieGoal, 1), 1)
  const caloriesRemaining = Math.max(0, Math.round(calorieGoal - caloriesConsumed))
  const ringBackground = `conic-gradient(var(--color-primary) ${completionPercentage * 360}deg, var(--color-progress-track) 0)`

  return <div className="relative grid size-28 shrink-0 place-items-center rounded-full compact:size-32" style={{ background: ringBackground }}>
    <div className="absolute inset-control-wide rounded-full bg-surface" />
    <div className="relative z-10 flex flex-col items-center">
      <strong className="text-2xl tracking-tight">{caloriesRemaining.toLocaleString()}</strong>
      <span className="text-caption font-bold text-muted">cal left</span>
    </div>
  </div>
}
