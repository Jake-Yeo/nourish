import { isIP } from 'node:net'
import { normalizeBoundedText } from './normalizeBoundedText.mjs'

const forbiddenNames = new Set(['localhost', 'localhost.localdomain'])
const forbiddenSuffixes = ['.localhost', '.local', '.internal', '.home', '.lan']
const privateV4 = value => {
  const [a, b] = value.split('.').map(Number)
  return a === 0 || a === 10 || a === 127 || a >= 224 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || (a === 198 && (b === 18 || b === 19))
}
const privateV6 = value => value === '::' || value === '::1' || value.startsWith('fc') || value.startsWith('fd') || value.startsWith('fe8') || value.startsWith('fe9') || value.startsWith('fea') || value.startsWith('feb') || value.startsWith('::ffff:')
const isPublicHostname = hostname => {
  const name = hostname.toLowerCase().replace(/\.$/, '')
  if (!name || forbiddenNames.has(name) || forbiddenSuffixes.some(suffix => name.endsWith(suffix))) return false
  const kind = isIP(name)
  if (kind === 4) return !privateV4(name)
  if (kind === 6) return !privateV6(name)
  return name.includes('.') && /^[a-z0-9.-]+$/.test(name)
}
export function validatePublicSource(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).some(key => !['title', 'url'].includes(key))) return null
  const title = normalizeBoundedText(value.title, 200)
  if (!title) return null
  if (value.url === undefined || value.url === null || value.url === '') return { title }
  if (typeof value.url !== 'string') return null
  const rawUrl = normalizeBoundedText(value.url, 500)
  if (!rawUrl || rawUrl !== value.url.trim()) return null
  try {
    const url = new URL(rawUrl)
    if (url.protocol !== 'https:' || url.username || url.password || !isPublicHostname(url.hostname)) return null
    return { title, url: url.href }
  } catch { return null }
}
export function validateSources(values) {
  if (!Array.isArray(values) || values.length > 12) return null
  const sources = values.map(validatePublicSource)
  return sources.every(Boolean) ? sources : null
}
