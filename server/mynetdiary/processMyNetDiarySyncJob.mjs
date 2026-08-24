import { databaseConnection } from '../database/databaseConnection.mjs'
import { claimMyNetDiarySyncJob, completeMyNetDiarySyncJob, failMyNetDiarySyncJob, interruptMyNetDiarySyncJobs } from '../database/myNetDiarySyncJobStore.mjs'
import { synchronizeMyNetDiary } from './synchronizeMyNetDiary.mjs'

let acceptingWork = true
const liveSyncs = new Map()

export async function processMyNetDiarySyncJob(id, dependencies = {}) {
  const database = dependencies.database || databaseConnection
  const synchronize = dependencies.synchronize || synchronizeMyNetDiary
  if (!acceptingWork || !claimMyNetDiarySyncJob(database, id)) return false
  const abortController = new AbortController()
  const pendingHandle = { close: () => abortController.abort() }
  const ownership = handle => {
    const ownedHandle = { close: () => { abortController.abort(); return handle.close() } }
    liveSyncs.set(id, ownedHandle)
    return () => { if (liveSyncs.get(id) === ownedHandle) liveSyncs.delete(id) }
  }
  liveSyncs.set(id, pendingHandle)
  try {
    const result = await synchronize({ ownHandle: ownership, signal: abortController.signal })
    if (!acceptingWork || abortController.signal.aborted) return false
    completeMyNetDiarySyncJob(database, id, result)
    return true
  } catch (error) {
    if (acceptingWork) failMyNetDiarySyncJob(database, id, error instanceof Error ? error.message : 'Could not import MyNetDiary data.')
    return false
  } finally { liveSyncs.delete(id) }
}

export function scheduleMyNetDiarySyncJob(id) {
  if (acceptingWork) setImmediate(() => void processMyNetDiarySyncJob(id))
}

export function isMyNetDiarySyncWorkerAccepting() { return acceptingWork }

export async function shutdownMyNetDiarySyncWorker(reason = 'Nourish stopped before this sync finished.') {
  acceptingWork = false
  await Promise.allSettled([...liveSyncs.values()].map(handle => handle.close()))
  interruptMyNetDiarySyncJobs(databaseConnection, reason)
}

export function resetMyNetDiarySyncWorkerForHarness() {
  acceptingWork = true
  liveSyncs.clear()
}
