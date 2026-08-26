import fs from 'node:fs/promises'
import { spawn } from 'node:child_process'
import path from 'node:path'
import { buildMealAnalysisContent } from './buildMealAnalysisContent.mjs'
import { createContactSheet, findExecutable } from './createContactSheet.mjs'
import { parseHermesAgentResponse } from './parseHermesAgentResponse.mjs'
import { parseMealEstimateResponse } from './parseMealEstimateResponse.mjs'

const OUTPUT_LIMIT = 256_000
const HERMES_MODEL = 'gpt-5.6-terra'
const HERMES_PROVIDER = 'openai-codex'
const ANALYSIS_TIMEOUT_MS = 300_000
const MINIMUM_REPAIR_TIME_MS = 10_000
function killProcess(child) {
  if (!child.pid || child.killed) return
  try { process.kill(-child.pid, 'SIGKILL') } catch { try { child.kill('SIGKILL') } catch {} }
}
export function runBounded(command, args, signal, onOwnedProcess, timeoutMs = ANALYSIS_TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    const nodeDirectory = path.dirname(process.execPath)
    const child = spawn(command, args, {
      detached: true,
      env: { ...process.env, PATH: [nodeDirectory, process.env.PATH].filter(Boolean).join(path.delimiter) },
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    })
    const releaseOwnership = onOwnedProcess?.({ child, kill: () => killProcess(child) }) || (() => {})
    let stdout = Buffer.alloc(0); let stderr = Buffer.alloc(0); let settled = false
    const finish = error => {
      if (settled) return
      settled = true; clearTimeout(timer); signal?.removeEventListener('abort', abort); releaseOwnership()
      if (error) reject(error); else resolve({ stdout: stdout.toString('utf8'), stderr: stderr.toString('utf8') })
    }
    const fail = (message, statusCode) => { killProcess(child); finish(Object.assign(new Error(message), { statusCode })) }
    const append = (stream, chunk) => {
      const combined = Buffer.concat([stream, chunk])
      if (combined.length > OUTPUT_LIMIT) fail('Hermes returned too much output.', 502)
      return combined
    }
    const abort = () => fail('Meal analysis was cancelled.', 499)
    const timer = setTimeout(() => fail('Hermes meal analysis timed out.', 504), timeoutMs)
    signal?.addEventListener('abort', abort, { once: true })
    if (signal?.aborted) return abort()
    child.stdout.on('data', chunk => { stdout = append(stdout, chunk) })
    child.stderr.on('data', chunk => { stderr = append(stderr, chunk) })
    child.once('error', () => finish(Object.assign(new Error('Hermes meal analysis could not start.'), { statusCode: 503 })))
    child.once('close', code => code === 0 ? finish() : fail('Hermes meal analysis did not complete.', 502))
  })
}
function parseSessionId(stderr) {
  return /^session_id:\s*(\S+)\s*$/m.exec(String(stderr))?.[1] || null
}
export function buildHermesArguments(prompt, imagePath, sessionId = null) {
  const args = ['chat', '-Q', '-q', prompt, '-m', HERMES_MODEL, '--provider', HERMES_PROVIDER, '--reasoning', 'medium', '-t', 'web', '--max-turns', '24', '--source', 'cli']
  if (sessionId) args.push('--resume', sessionId, '--no-restore-cwd')
  else args.push('--image', imagePath)
  return args
}
const repairPrompt = `Your previous nutrition JSON failed Nourish's strict validation. Return a corrected JSON object only, using the exact schema from the original request. Put the internal plausible calorie bounds only in calorieCalibration, set the single final calories to exactly 60% from plausibleLow to plausibleHigh within one calorie, and do not mention a calorie range in the visible explanation. Include every meaningful energy-bearing component in calorieBreakdown and make those components sum to the item and total calories within one calorie.`
export async function requestMealEstimate(item, overallNote, signal, onOwnedProcess) {
  const hermes = await findExecutable('hermes')
  if (!hermes) throw Object.assign(new Error('Hermes meal analysis is unavailable. Install Hermes Agent and restart Nourish.'), { statusCode: 503 })
  const artifact = await createContactSheet(item.photos)
  try {
    const deadline = Date.now() + ANALYSIS_TIMEOUT_MS
    const prompt = buildMealAnalysisContent(item, overallNote)
    let sessionId = null
    const run = async message => {
      const remaining = deadline - Date.now()
      if (remaining <= 0) throw Object.assign(new Error('Hermes meal analysis timed out.'), { statusCode: 504 })
      const result = await runBounded(hermes, buildHermesArguments(message, artifact.imagePath, sessionId), signal, onOwnedProcess, remaining)
      sessionId ||= parseSessionId(result.stderr)
      return parseHermesAgentResponse(result.stdout)
    }
    const firstResponse = await run(prompt)
    try { return parseMealEstimateResponse(firstResponse) }
    catch (error) {
      if (deadline - Date.now() < MINIMUM_REPAIR_TIME_MS) throw error
      if (!sessionId) throw Object.assign(new Error('Hermes did not return a resumable meal analysis session.'), { statusCode: 502 })
      return parseMealEstimateResponse(await run(repairPrompt))
    }
  } finally { await fs.rm(artifact.directory, { recursive: true, force: true }) }
}
