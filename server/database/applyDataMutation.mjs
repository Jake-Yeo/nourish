export function applyDataMutation(currentData, dataMutation) {
  if (dataMutation?.type === 'addEntries' && Array.isArray(dataMutation.entries)) {
    const existingEntryIdentifiers = new Set(currentData.entries.map(entry => entry.id))
    return { ...currentData, entries: [...currentData.entries, ...dataMutation.entries.filter(entry => entry?.id && !existingEntryIdentifiers.has(entry.id))] }
  }
  if (dataMutation?.type === 'deleteEntry' && typeof dataMutation.id === 'string') {
    return { ...currentData, entries: currentData.entries.filter(entry => entry.id !== dataMutation.id || entry.source === 'mynetdiary') }
  }
  if (dataMutation?.type === 'moveEntries' && Array.isArray(dataMutation.ids) && /^\d{4}-\d{2}-\d{2}$/.test(dataMutation.date) && ['Breakfast', 'Lunch', 'Dinner', 'Snacks'].includes(dataMutation.meal)) {
    const movableEntryIds = new Set(dataMutation.ids.filter(id => typeof id === 'string'))
    return { ...currentData, entries: currentData.entries.map(entry => movableEntryIds.has(entry.id) && entry.source !== 'mynetdiary' ? { ...entry, date: dataMutation.date, meal: dataMutation.meal } : entry) }
  }
  if (dataMutation?.type === 'updateGoals' && dataMutation.goals && typeof dataMutation.goals === 'object') {
    return { ...currentData, goals: { ...currentData.goals, ...dataMutation.goals } }
  }
  if (dataMutation?.type === 'updateWeightChangeStartDate' && /^\d{4}-\d{2}-\d{2}$/.test(dataMutation.startDate)) {
    return { ...currentData, weightChangeStartDate: dataMutation.startDate }
  }
  if (dataMutation?.type === 'replaceMyNetDiary' && Array.isArray(dataMutation.entries) && Array.isArray(dataMutation.years)) {
    const importedYears = new Set(dataMutation.years.map(String))
    const retainedEntries = currentData.entries.filter(entry => entry.source !== 'mynetdiary' || !importedYears.has(entry.date?.slice(0, 4)))
    return { ...currentData, entries: [...retainedEntries, ...dataMutation.entries], lastMyNetDiarySync: Number(dataMutation.syncedAt) || Date.now() }
  }
  return null
}
