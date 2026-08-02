import type { DiaryEntrySource } from '../../types'
import { Badge } from '../../components/ui/Badge'

const sourceLabels: Record<DiaryEntrySource, string> = {
  mynetdiary: 'MyNetDiary', 'nourish-photo': 'AI photo', 'nourish-barcode': 'Barcode', 'nourish-manual': 'Nourish',
}

const sourceVariants: Record<DiaryEntrySource, 'info' | 'ai' | 'neutral'> = {
  mynetdiary: 'info', 'nourish-photo': 'ai', 'nourish-barcode': 'neutral', 'nourish-manual': 'neutral',
}

export function DiarySourceBadge({ source = 'nourish-manual' }: { source?: DiaryEntrySource }) {
  return <Badge size="compact" variant={sourceVariants[source]}>{sourceLabels[source]}</Badge>
}
