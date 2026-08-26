import fs from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import path from 'node:path'
import { buildMealAnalysisContent } from './buildMealAnalysisContent.mjs'
import { createContactSheet, findExecutable } from './createContactSheet.mjs'
import { parseMealEstimateResponse } from './parseMealEstimateResponse.mjs'
import { parseOpenClawAgentResponse } from './parseOpenClawAgentResponse.mjs'

const OUTPUT_LIMIT = 256_000
const OPENCLAW_MODEL = 'openai/gpt-5.6-terra'
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
    let stdout = Buffer.alloc(0); let stderrSize = 0; let settled = false
    const finish = error => {
      if (settled) return
      settled = true; clearTimeout(timer); signal?.removeEventListener('abort', abort); releaseOwnership()
      if (error) reject(error); else resolve(stdout.toString('utf8'))
    }
    const fail = (message, statusCode) => { killProcess(child); finish(Object.assign(new Error(message), { statusCode })) }
    const append = chunk => { stdout = Buffer.concat([stdout, chunk]); if (stdout.length > OUTPUT_LIMIT) fail('OpenClaw returned too much output.', 502) }
    const abort = () => fail('Meal analysis was cancelled.', 499)
    const timer = setTimeout(() => fail('OpenClaw meal analysis timed out.', 504), timeoutMs)
    signal?.addEventListener('abort', abort, { once: true })
    if (signal?.aborted) return abort()
    child.stdout.on('data', append)
    child.stderr.on('data', chunk => { stderrSize += chunk.length; if (stderrSize > OUTPUT_LIMIT) fail('OpenClaw returned too much diagnostic output.', 502) })
    child.once('error', () => finish(Object.assign(new Error('OpenClaw meal analysis could not start.'), { statusCode: 503 })))
    child.once('close', code => code === 0 ? finish() : fail('OpenClaw meal analysis did not complete.', 502))
  })
}
export function buildOpenClawArguments(prompt, imagePath, sessionId = randomUUID(), timeoutSeconds = 300) {
  const imageInstruction = `Use the image inspection tool to inspect this contact sheet before estimating: ${imagePath}\nThe file is temporary and read-only for this analysis. Do not perform unrelated actions.`
  return ['agent', '--agent', 'main', '--session-key', `agent:main:nourish-analysis-${sessionId}`, '--model', OPENCLAW_MODEL, '--thinking', 'medium', '--timeout', String(timeoutSeconds), '--json', '--message', `${prompt}\n\n${imageInstruction}`]
}
const repairPrompt = `Your previous nutrition JSON failed Nourish's strict validation. Return a corrected JSON object only, using the exact schema from the original request. Provide one best realistic calorie estimate with no calorie ranges. Include every meaningful energy-bearing component in calorieBreakdown, make those component calories sum to the item and total calories within one calorie, and explain why that exact total best fits the visible evidence. Do not deliberately bias the estimate high or low.`
export async function requestMealEstimate(item, overallNote, signal, onOwnedProcess) {
  const openClaw = await findExecutable('openclaw')
  if (!openClaw) throw Object.assign(new Error('OpenClaw meal analysis is unavailable. Install the OpenClaw CLI and restart Nourish.'), { statusCode: 503 })
  const artifact = await createContactSheet(item.photos)
  try {
    const deadline = Date.now() + ANALYSIS_TIMEOUT_MS
    const sessionId = randomUUID()
    const prompt = buildMealAnalysisContent(item, overallNote)
    const run = async message => {
      const remaining = deadline - Date.now()
      if (remaining <= 0) throw Object.assign(new Error('OpenClaw meal analysis timed out.'), { statusCode: 504 })
      const timeoutSeconds = Math.max(1, Math.ceil(remaining / 1_000))
      const args = buildOpenClawArguments(message, artifact.imagePath, sessionId, timeoutSeconds)
      return parseOpenClawAgentResponse(await runBounded(openClaw, args, signal, onOwnedProcess, remaining))
    }
    const firstResponse = await run(prompt)
    try { return parseMealEstimateResponse(firstResponse) }
    catch (error) {
      if (deadline - Date.now() < MINIMUM_REPAIR_TIME_MS) throw error
      return parseMealEstimateResponse(await run(repairPrompt))
    }
  } finally { await fs.rm(artifact.directory, { recursive: true, force: true }) }
}
