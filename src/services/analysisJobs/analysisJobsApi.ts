import type { MealAnalysisJob } from '../../types/photoMeal'

async function readJson(response: Response) {
  const result = await response.json()
  if (!response.ok) throw new Error(result.error || 'Could not load meal analyses.')
  return result
}
export async function fetchAnalysisJobs(): Promise<MealAnalysisJob[]> { return readJson(await fetch('/api/analysis-jobs', { cache: 'no-store' })) }
export async function fetchAnalysisJob(id: string): Promise<MealAnalysisJob> { return readJson(await fetch(`/api/analysis-jobs/${id}`, { cache: 'no-store' })) }
export async function retryAnalysisJob(id: string): Promise<MealAnalysisJob> { return readJson(await fetch(`/api/analysis-jobs/${id}/retry`, { method: 'POST' })) }
