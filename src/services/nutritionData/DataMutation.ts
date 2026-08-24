import type { DiaryEntry, Goals, MealType } from '../../types'

export type DataMutation =
  | { type: 'addEntries'; entries: DiaryEntry[] }
  | { type: 'deleteEntry'; id: string }
  | { type: 'moveEntries'; ids: string[]; date: string; meal: MealType }
  | { type: 'updateGoals'; goals: Goals }
  | { type: 'updateWeightChangeStartDate'; startDate: string }
  | { type: 'replaceMyNetDiary'; entries: DiaryEntry[]; years: string[]; syncedAt: number }
