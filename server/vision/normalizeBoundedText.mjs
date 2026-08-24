const controlCharacters = /[\p{Cc}\p{Cf}]+/gu

export function normalizeBoundedText(value, maxLength) {
  if (typeof value !== 'string' || !Number.isInteger(maxLength) || maxLength < 1) return ''
  const normalized = value.normalize('NFC').replace(controlCharacters, ' ').trim()
  return Array.from(normalized).slice(0, maxLength).join('').trim()
}
