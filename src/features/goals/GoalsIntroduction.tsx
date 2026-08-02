import { Target } from 'lucide-react'
import { Stack } from '../../components/ui/Stack'
import { Typography } from '../../components/ui/Typography'

export function GoalsIntroduction() {
  return <div className="flex gap-control-wide px-control py-control">
    <div className="grid size-icon-medium shrink-0 place-items-center rounded-button bg-primary-soft text-primary"><Target /></div>
    <Stack gap="control"><Typography variant="eyebrow">Personal plan</Typography><Typography as="h2" variant="pageTitle">Nutrition goals</Typography><Typography variant="muted">Set targets that fit how you eat. You can change them anytime.</Typography></Stack>
  </div>
}
