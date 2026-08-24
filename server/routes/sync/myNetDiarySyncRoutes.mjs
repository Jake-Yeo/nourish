import { databaseConnection } from '../../database/databaseConnection.mjs'
import { createMyNetDiarySyncJob, getLatestMyNetDiarySyncJob } from '../../database/myNetDiarySyncJobStore.mjs'
import { isMyNetDiarySyncWorkerAccepting, scheduleMyNetDiarySyncJob } from '../../mynetdiary/processMyNetDiarySyncJob.mjs'

export function queueMyNetDiarySync(_request, response) {
  if (!isMyNetDiarySyncWorkerAccepting()) return response.status(503).json({ error: 'Nourish is shutting down and cannot queue a sync.' })
  try {
    const queued = createMyNetDiarySyncJob(databaseConnection)
    if (queued.created) scheduleMyNetDiarySyncJob(queued.job.id)
    response.status(202).json(queued)
  } catch (error) {
    response.status(500).json({ error: error instanceof Error ? error.message : 'Could not queue MyNetDiary sync.' })
  }
}

export function latestMyNetDiarySync(_request, response) {
  response.json({ job: getLatestMyNetDiarySyncJob(databaseConnection) || null })
}
