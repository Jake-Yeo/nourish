import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

function collectSourceFiles(directoryPath) {
  return readdirSync(directoryPath, { withFileTypes: true }).flatMap(directoryEntry => {
    const entryPath = path.join(directoryPath, directoryEntry.name)
    if (directoryEntry.isDirectory()) return collectSourceFiles(entryPath)
    return /\.(ts|tsx|mjs)$/.test(directoryEntry.name) ? [entryPath] : []
  })
}

const sourceFiles = [...collectSourceFiles('src'), ...collectSourceFiles('server'), 'server.mjs']
const architectureViolations = []
for (const sourceFile of sourceFiles) {
  const sourceText = readFileSync(sourceFile, 'utf8')
  const sourceLineCount = sourceText.split('\n').length
  if (sourceLineCount > 100) architectureViolations.push(`${sourceFile} has ${sourceLineCount} lines`)
  if (sourceFile.endsWith('.tsx') && /#[\da-f]{3,8}/i.test(sourceText)) architectureViolations.push(`${sourceFile} contains a raw color value`)
  if (sourceFile.endsWith('.tsx') && /\[[\d.]+(?:px|rem)\]/.test(sourceText)) architectureViolations.push(`${sourceFile} contains raw spacing or sizing`)
}
if (architectureViolations.length) {
  process.stderr.write(`${architectureViolations.join('\n')}\n`)
  process.exit(1)
}
