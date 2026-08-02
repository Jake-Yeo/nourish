import { LoaderCircle, Sparkles } from 'lucide-react'
import { Typography } from '../../components/ui/Typography'

export function MealAnalysisLoading() {
  return <div className="flex min-h-96 flex-col items-center justify-center p-card-large text-center">
    <div className="relative grid size-20 place-items-center rounded-card bg-primary-soft text-primary"><LoaderCircle className="w-12 animate-spin" /><Sparkles className="absolute -right-1 -bottom-1 w-7 rounded-full bg-primary p-control text-surface" /></div>
    <Typography as="h3" variant="sectionTitle" className="mt-card">Estimating portions and macros</Typography>
    <Typography variant="muted" className="mt-control max-w-sm">Comparing all angles and reading your notes. This usually takes a moment.</Typography>
  </div>
}
