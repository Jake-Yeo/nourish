import XLSX from 'xlsx'
import { createMyNetDiaryEntry } from './createMyNetDiaryEntry.mjs'
import { parseMyNetDiaryDate } from './parseMyNetDiaryDate.mjs'

export function parseMyNetDiaryWorkbook(workbookPath) {
  const workbook = XLSX.readFile(workbookPath, { cellDates: false })
  const foodSheet = workbook.Sheets.Food
  if (!foodSheet) throw new Error('The MyNetDiary workbook has no Food sheet.')
  const workbookRows = XLSX.utils.sheet_to_json(foodSheet, { defval: null, raw: false })
  const occurrenceCounts = new Map()
  return workbookRows.flatMap(workbookRow => {
    const parsedDate = parseMyNetDiaryDate(workbookRow['Date & Time'])
    if (!parsedDate || !workbookRow.Name) return []
    const baseIdentifier = [parsedDate.date, workbookRow['Date & Time'], workbookRow.Meal, workbookRow['Food ID'], workbookRow.Amount].join('|')
    const occurrenceNumber = occurrenceCounts.get(baseIdentifier) || 0
    occurrenceCounts.set(baseIdentifier, occurrenceNumber + 1)
    return [createMyNetDiaryEntry(workbookRow, occurrenceNumber)]
  }).filter(Boolean)
}
