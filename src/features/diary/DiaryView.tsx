import { mealTypes, type DiaryEntry, type MealType } from '../../types'
import { MealDiaryCard } from './MealDiaryCard'

type DiaryViewProps = { entries: DiaryEntry[]; onAdd: (meal: MealType) => void; onDelete: (id: string) => void; onSelect: (entry: DiaryEntry) => void }

export function DiaryView({ entries, onAdd, onDelete, onSelect }: DiaryViewProps) {
  return <>{mealTypes.map(mealType => <MealDiaryCard entries={entries} key={mealType} mealType={mealType} onAdd={onAdd} onDelete={onDelete} onSelect={onSelect} />)}</>
}
