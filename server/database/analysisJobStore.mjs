import { createHash, randomUUID } from 'node:crypto'

export function initializeAnalysisJobSchema(database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS meal_analysis_jobs (
      id TEXT PRIMARY KEY, status TEXT NOT NULL CHECK (status IN ('queued','running','completed','failed','interrupted')),
      request_json TEXT NOT NULL, result_json TEXT, error TEXT, attempt INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL, started_at INTEGER, finished_at INTEGER, updated_at INTEGER NOT NULL,
      logged_at INTEGER, logged_meal_id TEXT
    );
    CREATE INDEX IF NOT EXISTS meal_analysis_jobs_history ON meal_analysis_jobs(created_at DESC);
  `)
  const columns = database.prepare('PRAGMA table_info(meal_analysis_jobs)').all().map(column => column.name)
  if (!columns.includes('idempotency_key')) database.exec('ALTER TABLE meal_analysis_jobs ADD COLUMN idempotency_key TEXT')
  if (!columns.includes('request_hash')) database.exec('ALTER TABLE meal_analysis_jobs ADD COLUMN request_hash TEXT')
  database.exec('CREATE UNIQUE INDEX IF NOT EXISTS meal_analysis_jobs_idempotency ON meal_analysis_jobs(idempotency_key) WHERE idempotency_key IS NOT NULL')
}

const parse = value => value ? JSON.parse(value) : null
const stripSourcePhotos = source => ({ ...source, items: source.items.map(({ photos: _photos, ...item }) => ({ ...item, photos: [] })) })
const mapJob = row => row && ({ id: row.id, status: row.status, source: parse(row.requestJson), result: parse(row.resultJson), error: row.error, attempt: row.attempt, createdAt: row.createdAt, startedAt: row.startedAt, finishedAt: row.finishedAt, updatedAt: row.updatedAt, loggedAt: row.loggedAt, loggedMealId: row.loggedMealId })
const mapJobSummary = row => { const job = mapJob(row); return job && { ...job, source: stripSourcePhotos(job.source) } }
const selectColumns = 'id, status, request_json requestJson, result_json resultJson, error, attempt, created_at createdAt, started_at startedAt, finished_at finishedAt, updated_at updatedAt, logged_at loggedAt, logged_meal_id loggedMealId'
const hashRequest = source => createHash('sha256').update(JSON.stringify(source)).digest('hex')

export function createAnalysisJob(database, source, idempotencyKey) {
  const requestHash = hashRequest(source)
  database.exec('BEGIN IMMEDIATE')
  try {
    const existing = database.prepare(`SELECT ${selectColumns}, request_hash requestHash FROM meal_analysis_jobs WHERE idempotency_key=?`).get(idempotencyKey)
    if (existing) {
      if (existing.requestHash !== requestHash) throw Object.assign(new Error('That analysis key was already used for a different meal capture.'), { statusCode: 409 })
      database.exec('COMMIT')
      return { job: mapJob(existing), created: false }
    }
    const id = randomUUID(); const now = Date.now()
    database.prepare("INSERT INTO meal_analysis_jobs (id,status,request_json,created_at,updated_at,idempotency_key,request_hash) VALUES (?,'queued',?,?,?,?,?)").run(id, JSON.stringify(source), now, now, idempotencyKey, requestHash)
    database.exec('COMMIT')
    return { job: getAnalysisJob(database, id), created: true }
  } catch (error) { database.exec('ROLLBACK'); throw error }
}
export function getAnalysisJob(database, id) { return mapJob(database.prepare(`SELECT ${selectColumns} FROM meal_analysis_jobs WHERE id = ?`).get(id)) }
export function listAnalysisJobs(database) { return database.prepare(`SELECT ${selectColumns} FROM meal_analysis_jobs ORDER BY created_at DESC LIMIT 100`).all().map(mapJobSummary) }
export function claimAnalysisJob(database, id) { const now = Date.now(); return database.prepare("UPDATE meal_analysis_jobs SET status='running', started_at=?, updated_at=?, error=NULL WHERE id=? AND status='queued'").run(now, now, id).changes === 1 }
export function completeAnalysisJob(database, id, result) { const now = Date.now(); return database.prepare("UPDATE meal_analysis_jobs SET status='completed', result_json=?, finished_at=?, updated_at=? WHERE id=? AND status='running'").run(JSON.stringify(result), now, now, id).changes === 1 }
export function failAnalysisJob(database, id, error) { const now = Date.now(); return database.prepare("UPDATE meal_analysis_jobs SET status='failed', error=?, finished_at=?, updated_at=? WHERE id=? AND status='running'").run(String(error).slice(0, 1000), now, now, id).changes === 1 }
export function interruptUnfinishedAnalysisJobs(database, reason = 'Nourish restarted before this analysis finished.') { const now = Date.now(); return database.prepare("UPDATE meal_analysis_jobs SET status='interrupted', error=?, finished_at=?, updated_at=? WHERE status IN ('queued','running')").run(String(reason).slice(0, 300), now, now).changes }
export function retryAnalysisJob(database, id) { const now = Date.now(); const changed = database.prepare("UPDATE meal_analysis_jobs SET status='queued', result_json=NULL, error=NULL, started_at=NULL, finished_at=NULL, updated_at=?, attempt=attempt+1 WHERE id=? AND status IN ('failed','interrupted')").run(now, id).changes; return changed ? getAnalysisJob(database, id) : null }
export function linkAnalysisJobToMeal(database, id, mealId) { const now = Date.now(); return database.prepare("UPDATE meal_analysis_jobs SET logged_at=?, logged_meal_id=?, updated_at=? WHERE id=? AND status='completed' AND logged_at IS NULL").run(now, mealId, now, id).changes === 1 }
