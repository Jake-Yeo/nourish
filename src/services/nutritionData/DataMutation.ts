import type { DiaryEntry, Goals } from '../../types'

export type DataMutation =
  | { type: 'addEntries'; entries: DiaryEntry[] }
  | { type: 'deleteEntry'; id: string }
  | { type: 'updateGoals'; goals: Goals }
  | { type: 'replaceMyNetDiary'; entries: DiaryEntry[]; years: string[]; syncedAt: number }
