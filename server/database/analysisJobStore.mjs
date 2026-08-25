import { createHash, randomUUID } from 'node:crypto'

export function initializeAnalysisJobSchema(database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS meal_analysis_jobs (
      id TEXT PRIMARY KEY, status TEXT NOT NULL CHECK (status IN ('queued','running','completed','failed','interrupted')),
      request_json TEXT NOT NULL, request_hash TEXT NOT NULL, result_json TEXT, error TEXT,
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL, started_at TEXT, finished_at TEXT,
      attempt INTEGER NOT NULL DEFAULT 1, logged_at TEXT, logged_meal_id TEXT,
      idempotency_key TEXT UNIQUE
    );
    CREATE INDEX IF NOT EXISTS idx_meal_analysis_jobs_created_at ON meal_analysis_jobs(created_at DESC);
  `)
  const columns = new Set(database.prepare('PRAGMA table_info(meal_analysis_jobs)').all().map(column => column.name))
  if (!columns.has('logged_at')) database.exec('ALTER TABLE meal_analysis_jobs ADD COLUMN logged_at TEXT')
  if (!columns.has('logged_meal_id')) database.exec('ALTER TABLE meal_analysis_jobs ADD COLUMN logged_meal_id TEXT')
  if (!columns.has('idempotency_key')) database.exec('ALTER TABLE meal_analysis_jobs ADD COLUMN idempotency_key TEXT')
  if (!columns.has('previous_request_json')) database.exec('ALTER TABLE meal_analysis_jobs ADD COLUMN previous_request_json TEXT')
  if (!columns.has('previous_result_json')) database.exec('ALTER TABLE meal_analysis_jobs ADD COLUMN previous_result_json TEXT')
}

const selectColumns = 'id,status,request_json,result_json,error,created_at,updated_at,started_at,finished_at,attempt,logged_at,logged_meal_id'
const mapJob = row => row && ({ id: row.id, status: row.status, source: JSON.parse(row.request_json), result: row.result_json ? JSON.parse(row.result_json) : null, error: row.error, createdAt: row.created_at, updatedAt: row.updated_at, startedAt: row.started_at, finishedAt: row.finished_at, attempt: row.attempt, loggedAt: row.logged_at, loggedMealId: row.logged_meal_id })
const mapSummary = row => { const mapped = mapJob(row); if (!mapped) return mapped; return { ...mapped, source: { ...mapped.source, items: mapped.source.items.map(item => ({ ...item, photos: [] })) } } }
const hashRequest = request => createHash('sha256').update(JSON.stringify(request)).digest('hex')

export function createAnalysisJob(database, request, idempotencyKey) {
  const now = new Date().toISOString(), requestHash = hashRequest(request)
  const transaction = database.transaction(() => {
    const existing = database.prepare(`SELECT ${selectColumns},request_hash FROM meal_analysis_jobs WHERE idempotency_key = ?`).get(idempotencyKey)
    if (existing) {
      if (existing.request_hash !== requestHash) throw Object.assign(new Error('That analysis key was already used for different photos or notes.'), { code: 'IDEMPOTENCY_CONFLICT', statusCode: 409 })
      return { job: mapJob(existing), created: false }
    }
    const job = { id: randomUUID(), status: 'queued', source: request, result: null, error: null, createdAt: now, updatedAt: now, startedAt: null, finishedAt: null, attempt: 1, loggedAt: null, loggedMealId: null }
    database.prepare('INSERT INTO meal_analysis_jobs (id,status,request_json,request_hash,created_at,updated_at,attempt,idempotency_key) VALUES (?,?,?,?,?,?,1,?)').run(job.id, job.status, JSON.stringify(request), requestHash, now, now, idempotencyKey)
    return { job, created: true }
  })
  return transaction()
}

export function getAnalysisJob(database, id) { return mapJob(database.prepare(`SELECT ${selectColumns} FROM meal_analysis_jobs WHERE id = ?`).get(id)) }
export function listAnalysisJobs(database, limit = 100) { return database.prepare(`SELECT ${selectColumns} FROM meal_analysis_jobs ORDER BY created_at DESC LIMIT ?`).all(limit).map(mapSummary) }
export function claimAnalysisJob(database, id) { const now = new Date().toISOString(); return database.prepare("UPDATE meal_analysis_jobs SET status='running',started_at=?,updated_at=?,error=NULL WHERE id=? AND status='queued'").run(now, now, id).changes === 1 }
export function completeAnalysisJob(database, id, result) { const now = new Date().toISOString(); return database.prepare("UPDATE meal_analysis_jobs SET status='completed',result_json=?,error=NULL,updated_at=?,finished_at=?,previous_request_json=NULL,previous_result_json=NULL WHERE id=? AND status='running'").run(JSON.stringify(result), now, now, id).changes === 1 }
export function failAnalysisJob(database, id, error) { const now = new Date().toISOString(); return database.prepare("UPDATE meal_analysis_jobs SET status=CASE WHEN previous_result_json IS NULL THEN 'failed' ELSE 'completed' END,request_json=COALESCE(previous_request_json,request_json),result_json=COALESCE(previous_result_json,result_json),error=?,updated_at=?,finished_at=?,previous_request_json=NULL,previous_result_json=NULL WHERE id=? AND status='running'").run(error, now, now, id).changes === 1 }
export function interruptUnfinishedAnalysisJobs(database, reason = 'Analysis was interrupted by a server restart.') { const now = new Date().toISOString(); return database.prepare("UPDATE meal_analysis_jobs SET status=CASE WHEN previous_result_json IS NULL THEN 'interrupted' ELSE 'completed' END,request_json=COALESCE(previous_request_json,request_json),result_json=COALESCE(previous_result_json,result_json),error=?,updated_at=?,finished_at=?,previous_request_json=NULL,previous_result_json=NULL WHERE status IN ('queued','running')").run(reason, now, now).changes }
export function retryAnalysisJob(database, id) { const now = new Date().toISOString(); const update = database.prepare("UPDATE meal_analysis_jobs SET status='queued',result_json=NULL,error=NULL,updated_at=?,started_at=NULL,finished_at=NULL,attempt=attempt+1 WHERE id=? AND status IN ('failed','interrupted') AND previous_result_json IS NULL").run(now, id); return update.changes === 1 ? getAnalysisJob(database, id) : null }
export function rerunAnalysisJob(database, id, request) { const now = new Date().toISOString(); const update = database.prepare("UPDATE meal_analysis_jobs SET previous_request_json=request_json,previous_result_json=result_json,request_json=?,status='queued',result_json=NULL,error=NULL,updated_at=?,started_at=NULL,finished_at=NULL,attempt=attempt+1 WHERE id=? AND status='completed' AND logged_at IS NULL AND previous_result_json IS NULL").run(JSON.stringify(request), now, id); return update.changes === 1 ? getAnalysisJob(database, id) : null }
export function deleteAnalysisJob(database, id) { return database.prepare("DELETE FROM meal_analysis_jobs WHERE id=? AND logged_at IS NULL AND status NOT IN ('queued','running')").run(id).changes === 1 }
export function linkAnalysisJobToMeal(database, id, mealId) { const now = new Date().toISOString(); return database.prepare("UPDATE meal_analysis_jobs SET logged_at=?,logged_meal_id=?,updated_at=? WHERE id=? AND status='completed' AND logged_at IS NULL").run(now, mealId, now, id).changes === 1 }
