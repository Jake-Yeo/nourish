import { databaseConnection } from '../database/databaseConnection.mjs'
import { claimAnalysisJob, completeAnalysisJob, failAnalysisJob, getAnalysisJob, interruptUnfinishedAnalysisJobs } from '../database/analysisJobStore.mjs'
import { requestMealEstimate } from './requestMealEstimate.mjs'

const confidenceRank = { low: 0, medium: 1, high: 2 }
const maximumCombinedSources = 48
const liveProcesses = new Map()
let acceptingWork = true
async function mapWithConcurrency(values, limit, task) {
  const results = new Array(values.length); let nextIndex = 0
  async function worker() { while (nextIndex < values.length) { const index = nextIndex++; results[index] = await task(values[index]) } }
  await Promise.all(Array.from({ length: Math.min(limit, values.length) }, worker)); return results
}
function ownProcess(jobId, handle) {
  const token = Symbol(jobId); liveProcesses.set(token, handle)
  return () => liveProcesses.delete(token)
}
function uniqueSources(estimates) {
  const sources = estimates.flatMap(estimate => estimate.researchDisclosure.sources || [])
  return [...new Map(sources.map(source => [source.url || `title:${source.title}`, source])).values()].slice(0, maximumCombinedSources)
}
function disclosureSummary(estimates) {
  const summaries = estimates.map(estimate => estimate.researchDisclosure.summary.trim()).filter(Boolean)
  const unique = [...new Set(summaries)]
  return unique.map((summary, index) => unique.length > 1 ? `Item ${index + 1}: ${summary}` : summary).join('\n\n')
}
export function combineEstimates(groups, estimates) {
  const items = estimates.map((estimate, index) => ({ ...estimate.items[0], groupId: groups[index].id, sources: estimate.researchDisclosure.sources }))
  const totals = items.reduce((sum, item) => Object.fromEntries(Object.keys(item.nutrients).map(key => [key, (sum[key] || 0) + item.nutrients[key]])), {})
  const confidence = estimates.reduce((lowest, estimate) => confidenceRank[estimate.confidence] < confidenceRank[lowest] ? estimate.confidence : lowest, 'high')
  const internetUsed = estimates.some(estimate => estimate.researchDisclosure.internetUsed)
  return { mealName: items.map(item => item.name).join(', '), confidence, summary: estimates.map(estimate => estimate.summary).join(' '), assumptions: estimates.flatMap(estimate => estimate.assumptions), items, totals, researchDisclosure: { internetUsed, sources: uniqueSources(estimates), summary: disclosureSummary(estimates) } }
}
export async function processAnalysisJob(id) {
  if (!acceptingWork || !claimAnalysisJob(databaseConnection, id)) return
  const job = getAnalysisJob(databaseConnection, id)
  const abortController = new AbortController()
  try {
    const estimate = item => requestMealEstimate(item, job.source.note, abortController.signal, handle => ownProcess(id, handle))
    const estimates = await mapWithConcurrency(job.source.items, 2, estimate)
    completeAnalysisJob(databaseConnection, id, combineEstimates(job.source.items, estimates))
  } catch (error) { failAnalysisJob(databaseConnection, id, error instanceof Error ? error.message : 'Hermes returned an invalid nutrition estimate.') }
}
export function scheduleAnalysisJob(id) { if (acceptingWork) setImmediate(() => void processAnalysisJob(id)) }
export async function shutdownAnalysisWorker(reason = 'Nourish stopped before this analysis finished.') {
  acceptingWork = false
  for (const handle of liveProcesses.values()) handle.kill()
  interruptUnfinishedAnalysisJobs(databaseConnection, reason)
}
export function resetAnalysisWorkerForHarness() { acceptingWork = true; liveProcesses.clear() }
