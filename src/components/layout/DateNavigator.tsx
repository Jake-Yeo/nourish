import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { getFriendlyDate } from '../../lib/dates/getFriendlyDate'
import { getTodayDateKey } from '../../lib/dates/getTodayDateKey'
import { shiftDateKey } from '../../lib/dates/shiftDateKey'
import { Button } from '../ui/Button'

export function DateNavigator({ dateKey, onDateChange }: { dateKey: string; onDateChange: (dateKey: string) => void }) {
  return <div className="mb-section grid grid-cols-date-navigation gap-control rounded-sheet border border-border bg-surface p-control shadow-control">
    <Button variant="ghost" size="icon" onClick={() => onDateChange(shiftDateKey(dateKey, -1))} aria-label="Previous day"><ChevronLeft /></Button>
    <Button variant="ghost" className="gap-control font-bold text-ink" onClick={() => onDateChange(getTodayDateKey())}><CalendarDays className="w-4" />{getFriendlyDate(dateKey)}</Button>
    <Button variant="ghost" size="icon" onClick={() => onDateChange(shiftDateKey(dateKey, 1))} aria-label="Next day"><ChevronRight /></Button>
  </div>
}
