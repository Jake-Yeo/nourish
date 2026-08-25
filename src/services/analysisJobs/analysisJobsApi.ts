import type { CaptureFoodItem, MealAnalysisJob, MealAnalysisSource } from '../../types/photoMeal'

async function readJson(response: Response) {
  const result = await response.json()
  if (!response.ok) throw new Error(result.error || 'Could not load meal analyses.')
  return result
}
export async function fetchAnalysisJobs(): Promise<MealAnalysisJob[]> { return readJson(await fetch('/api/analysis-jobs', { cache: 'no-store' })) }
export async function fetchAnalysisJob(id: string): Promise<MealAnalysisJob> { return readJson(await fetch(`/api/analysis-jobs/${id}`, { cache: 'no-store' })) }
export async function retryAnalysisJob(id: string): Promise<MealAnalysisJob> { return readJson(await fetch(`/api/analysis-jobs/${id}/retry`, { method: 'POST' })) }
export async function rerunAnalysisJob(id: string, source: MealAnalysisSource | { items: CaptureFoodItem[]; note: string; mealType: MealAnalysisSource['mealType']; date: string; replacement?: MealAnalysisSource['replacement'] }): Promise<MealAnalysisJob> {
  return readJson(await fetch(`/api/analysis-jobs/${id}/rerun`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(source) }))
}
export async function deleteAnalysisJob(id: string): Promise<void> {
  const response = await fetch(`/api/analysis-jobs/${id}`, { method: 'DELETE' })
  if (!response.ok) { const result = await response.json(); throw new Error(result.error || 'Could not delete analysis.') }
}
