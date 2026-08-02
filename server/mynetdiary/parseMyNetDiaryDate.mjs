export function parseMyNetDiaryDate(value) {
  const dateMatch = String(value).match(/^(\d{1,2})\s+(\d{1,2})\s+(\d{4})(?:\s+(\d{1,2}):(\d{2})\s+([AP]M))?/i)
  if (!dateMatch) return null
  const [, day, month, year, rawHour = '12', minute = '00', meridiem = 'AM'] = dateMatch
  let hour = Number(rawHour) % 12
  if (meridiem.toUpperCase() === 'PM') hour += 12
  return { date: `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`, timestamp: new Date(Number(year), Number(month) - 1, Number(day), hour, Number(minute)).getTime() }
}
