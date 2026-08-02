export function applyDataMutation(currentData, dataMutation) {
  if (dataMutation?.type === 'addEntries' && Array.isArray(dataMutation.entries)) {
    const existingEntryIdentifiers = new Set(currentData.entries.map(entry => entry.id))
    return { ...currentData, entries: [...currentData.entries, ...dataMutation.entries.filter(entry => entry?.id && !existingEntryIdentifiers.has(entry.id))] }
  }
  if (dataMutation?.type === 'deleteEntry' && typeof dataMutation.id === 'string') {
    return { ...currentData, entries: currentData.entries.filter(entry => entry.id !== dataMutation.id || entry.source === 'mynetdiary') }
  }
  if (dataMutation?.type === 'updateGoals' && dataMutation.goals && typeof dataMutation.goals === 'object') {
    return { ...currentData, goals: { ...currentData.goals, ...dataMutation.goals } }
  }
  if (dataMutation?.type === 'replaceMyNetDiary' && Array.isArray(dataMutation.entries) && Array.isArray(dataMutation.years)) {
    const importedYears = new Set(dataMutation.years.map(String))
    const retainedEntries = currentData.entries.filter(entry => entry.source !== 'mynetdiary' || !importedYears.has(entry.date?.slice(0, 4)))
    return { ...currentData, entries: [...retainedEntries, ...dataMutation.entries], lastMyNetDiarySync: Number(dataMutation.syncedAt) || Date.now() }
  }
  return null
}
