import { randomUUID } from 'node:crypto'
import { applyDataMutation } from './applyDataMutation.mjs'

const columns = 'id, status, result_json resultJson, error, created_at createdAt, started_at startedAt, finished_at finishedAt, updated_at updatedAt'
const parse = value => value ? JSON.parse(value) : null
const mapJob = row => row && ({ id: row.id, status: row.status, summary: parse(row.resultJson), error: row.error, createdAt: row.createdAt, startedAt: row.startedAt, finishedAt: row.finishedAt, updatedAt: row.updatedAt })

export function initializeMyNetDiarySyncJobSchema(database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS mynetdiary_sync_jobs (
      id TEXT PRIMARY KEY,
      status TEXT NOT NULL CHECK (status IN ('queued','running','completed','failed','interrupted')),
      result_json TEXT, error TEXT, created_at INTEGER NOT NULL, started_at INTEGER,
      finished_at INTEGER, updated_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS mynetdiary_sync_jobs_history ON mynetdiary_sync_jobs(created_at DESC);
    CREATE UNIQUE INDEX IF NOT EXISTS mynetdiary_sync_jobs_active ON mynetdiary_sync_jobs((1)) WHERE status IN ('queued','running');
  `)
}

export function getLatestMyNetDiarySyncJob(database) {
  return mapJob(database.prepare(`SELECT ${columns} FROM mynetdiary_sync_jobs ORDER BY created_at DESC LIMIT 1`).get())
}

export function createMyNetDiarySyncJob(database) {
  database.exec('BEGIN IMMEDIATE')
  try {
    const active = database.prepare(`SELECT ${columns} FROM mynetdiary_sync_jobs WHERE status IN ('queued','running') ORDER BY created_at DESC LIMIT 1`).get()
    if (active) { database.exec('COMMIT'); return { job: mapJob(active), created: false } }
    const id = randomUUID(); const now = Date.now()
    database.prepare("INSERT INTO mynetdiary_sync_jobs (id,status,created_at,updated_at) VALUES (?,'queued',?,?)").run(id, now, now)
    database.exec('COMMIT')
    return { job: getLatestMyNetDiarySyncJob(database), created: true }
  } catch (error) { database.exec('ROLLBACK'); throw error }
}

export function claimMyNetDiarySyncJob(database, id) {
  const now = Date.now()
  return database.prepare("UPDATE mynetdiary_sync_jobs SET status='running',started_at=?,updated_at=?,error=NULL WHERE id=? AND status='queued'").run(now, now, id).changes === 1
}

export function completeMyNetDiarySyncJob(database, id, result) {
  const years = [...new Set([String(result.exportYear), ...result.entries.map(entry => entry.date?.slice(0, 4)).filter(Boolean)])]
  const now = Date.now(); const summary = { entryCount: result.entries.length, exportYear: result.exportYear, file: result.file }
  database.exec('BEGIN IMMEDIATE')
  try {
    const row = database.prepare('SELECT data FROM app_state WHERE id=1').get()
    if (!row) throw Object.assign(new Error('Nourish database is not initialized.'), { statusCode: 409 })
    const updated = applyDataMutation(JSON.parse(row.data), { type: 'replaceMyNetDiary', entries: result.entries, years, syncedAt: result.exportedAt })
    if (!updated) throw new Error('MyNetDiary returned invalid nutrition data.')
    database.prepare('UPDATE app_state SET data=?,revision=revision+1,updated_at=? WHERE id=1').run(JSON.stringify(updated), now)
    const changed = database.prepare("UPDATE mynetdiary_sync_jobs SET status='completed',result_json=?,finished_at=?,updated_at=? WHERE id=? AND status='running'").run(JSON.stringify(summary), now, now, id).changes
    if (changed !== 1) throw new Error('MyNetDiary sync job is no longer active.')
    database.exec('COMMIT'); return true
  } catch (error) { database.exec('ROLLBACK'); throw error }
}

export function failMyNetDiarySyncJob(database, id, error) {
  const now = Date.now(); const message = String(error || 'Could not import MyNetDiary data.').replace(/[\r\n\t]+/g, ' ').slice(0, 300)
  return database.prepare("UPDATE mynetdiary_sync_jobs SET status='failed',error=?,finished_at=?,updated_at=? WHERE id=? AND status='running'").run(message, now, now, id).changes === 1
}

export function interruptMyNetDiarySyncJobs(database, reason = 'Nourish restarted before this sync finished.') {
  const now = Date.now(); const message = String(reason).replace(/[\r\n\t]+/g, ' ').slice(0, 300)
  return database.prepare("UPDATE mynetdiary_sync_jobs SET status='interrupted',error=?,finished_at=?,updated_at=? WHERE status IN ('queued','running')").run(message, now, now).changes
}
