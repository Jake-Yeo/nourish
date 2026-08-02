export function mergeMigratedData(storedData, localData) {
  if (!storedData) return localData
  const entriesByIdentifier = new Map(storedData.entries.map(entry => [entry.id, entry]))
  for (const entry of localData.entries) if (entry?.id && !entriesByIdentifier.has(entry.id)) entriesByIdentifier.set(entry.id, entry)
  return {
    ...storedData,
    entries: [...entriesByIdentifier.values()],
    lastMyNetDiarySync: Math.max(storedData.lastMyNetDiarySync || 0, localData.lastMyNetDiarySync || 0) || undefined,
  }
}
