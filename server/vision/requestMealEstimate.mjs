import fs from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { buildMealAnalysisContent } from './buildMealAnalysisContent.mjs'
import { createContactSheet, findExecutable } from './createContactSheet.mjs'
import { parseMealEstimateResponse } from './parseMealEstimateResponse.mjs'

const OUTPUT_LIMIT = 256_000
function killProcess(child) {
  if (!child.pid || child.killed) return
  try { process.kill(-child.pid, 'SIGKILL') } catch { try { child.kill('SIGKILL') } catch {} }
}
export function runBounded(command, args, signal, onOwnedProcess) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { detached: true, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true })
    const releaseOwnership = onOwnedProcess?.({ child, kill: () => killProcess(child) }) || (() => {})
    let stdout = Buffer.alloc(0); let stderrSize = 0; let settled = false
    const finish = error => {
      if (settled) return
      settled = true; clearTimeout(timer); signal?.removeEventListener('abort', abort); releaseOwnership()
      if (error) reject(error); else resolve(stdout.toString('utf8'))
    }
    const fail = (message, statusCode) => { killProcess(child); finish(Object.assign(new Error(message), { statusCode })) }
    const append = chunk => { stdout = Buffer.concat([stdout, chunk]); if (stdout.length > OUTPUT_LIMIT) fail('Hermes returned too much output.', 502) }
    const abort = () => fail('Meal analysis was cancelled.', 499)
    const timer = setTimeout(() => fail('Hermes meal analysis timed out.', 504), 300_000)
    signal?.addEventListener('abort', abort, { once: true })
    if (signal?.aborted) return abort()
    child.stdout.on('data', append)
    child.stderr.on('data', chunk => { stderrSize += chunk.length; if (stderrSize > OUTPUT_LIMIT) fail('Hermes returned too much diagnostic output.', 502) })
    child.once('error', () => finish(Object.assign(new Error('Hermes meal analysis could not start.'), { statusCode: 503 })))
    child.once('close', code => code === 0 ? finish() : fail('Hermes meal analysis did not complete.', 502))
  })
}
export function buildHermesArguments(prompt, imagePath) {
  return ['chat', '--query', prompt, '--image', imagePath, '--quiet', '--source', 'nourish', '--toolsets', 'browser,vision', '--ignore-rules']
}
export async function requestMealEstimate(item, overallNote, signal, onOwnedProcess) {
  const hermes = await findExecutable('hermes')
  if (!hermes) throw Object.assign(new Error('Hermes meal analysis is unavailable. Install the Hermes CLI and restart Nourish.'), { statusCode: 503 })
  const artifact = await createContactSheet(item.photos)
  try {
    const prompt = buildMealAnalysisContent(item, overallNote)
    return parseMealEstimateResponse(await runBounded(hermes, buildHermesArguments(prompt, artifact.imagePath), signal, onOwnedProcess))
  } finally { await fs.rm(artifact.directory, { recursive: true, force: true }) }
}
