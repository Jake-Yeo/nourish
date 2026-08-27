import express from 'express'
import path from 'node:path'
import { distributionDirectory } from './server/config/projectPaths.mjs'
import { runtimeConfiguration } from './server/config/runtimeConfiguration.mjs'
import { getHealthStatus } from './server/routes/health/getHealthStatus.mjs'
import { getApplicationData } from './server/routes/data/getApplicationData.mjs'
import { bootstrapApplicationData } from './server/routes/data/bootstrapApplicationData.mjs'
import { mutateApplicationData } from './server/routes/data/mutateApplicationData.mjs'
import { getMyNetDiaryCredentials } from './server/routes/credentials/getMyNetDiaryCredentials.mjs'
import { saveMyNetDiaryCredentials } from './server/routes/credentials/saveMyNetDiaryCredentials.mjs'
import { latestMyNetDiarySync, queueMyNetDiarySync } from './server/routes/sync/myNetDiarySyncRoutes.mjs'
import { analysisJob, analysisJobs, analyzeMeal, deleteMealAnalysis, rerunMealAnalysis, retryMealAnalysis } from './server/routes/vision/analyzeMeal.mjs'
import { interruptUnfinishedAnalysisJobs } from './server/database/analysisJobStore.mjs'
import { shutdownAnalysisWorker } from './server/vision/processAnalysisJob.mjs'
import { interruptMyNetDiarySyncJobs } from './server/database/myNetDiarySyncJobStore.mjs'
import { shutdownMyNetDiarySyncWorker } from './server/mynetdiary/processMyNetDiarySyncJob.mjs'
import { databaseConnection } from './server/database/databaseConnection.mjs'
import { askDayQuestion } from './server/routes/vision/askDayQuestion.mjs'
import { applyLoggedAnalysisUpdate, createPhotoMeal, deleteAllPhotos, patchPhotoMeal, photoStorageUsage, readPhotoMeal, replacePhotoMeal } from './server/routes/photos/photoMealRoutes.mjs'

const application = express()
application.use(express.json({ limit: '36mb' }))
application.get('/api/health', getHealthStatus)
application.get('/api/data', getApplicationData)
application.post('/api/data/bootstrap', bootstrapApplicationData)
application.post('/api/data/mutate', mutateApplicationData)
application.get('/api/mynetdiary-credentials', getMyNetDiaryCredentials)
application.post('/api/mynetdiary-credentials', saveMyNetDiaryCredentials)
application.post('/api/sync-mynetdiary', queueMyNetDiarySync)
application.get('/api/sync-mynetdiary', latestMyNetDiarySync)
application.post('/api/analyze-meal', analyzeMeal)
application.get('/api/analysis-jobs', analysisJobs)
application.get('/api/analysis-jobs/:jobId', analysisJob)
application.post('/api/analysis-jobs/:jobId/retry', retryMealAnalysis)
application.post('/api/analysis-jobs/:jobId/rerun', rerunMealAnalysis)
application.put('/api/analysis-jobs/:jobId/diary', applyLoggedAnalysisUpdate)
application.delete('/api/analysis-jobs/:jobId', deleteMealAnalysis)
application.post('/api/photo-meals', createPhotoMeal)
application.get('/api/photo-meals/storage', photoStorageUsage)
application.delete('/api/photo-meals', deleteAllPhotos)
application.get('/api/photo-meals/entry/:entryId', readPhotoMeal)
application.patch('/api/photo-meals/:mealId', patchPhotoMeal)
application.put('/api/photo-meals/:mealId/items/:itemId/entry', replacePhotoMeal)
application.post('/api/ask-day-question', askDayQuestion)
application.use((error, _request, response, next) => {
  if (error?.type === 'entity.too.large') return response.status(413).json({ error: 'That request is too large.' })
  next(error)
})
application.use(express.static(distributionDirectory, { maxAge: '1h' }))
application.get('*path', (_request, response) => response.sendFile(path.join(distributionDirectory, 'index.html')))
interruptUnfinishedAnalysisJobs(databaseConnection)
interruptMyNetDiarySyncJobs(databaseConnection)
const server = application.listen(runtimeConfiguration.port, '127.0.0.1', () => console.log(`Nourish running at http://127.0.0.1:${runtimeConfiguration.port}`))
let shuttingDown = false
async function gracefulShutdown() {
  if (shuttingDown) return
  shuttingDown = true
  const closed = new Promise(resolve => server.close(resolve))
  await Promise.all([
    shutdownAnalysisWorker('Nourish stopped before this analysis finished.'),
    shutdownMyNetDiarySyncWorker('Nourish stopped before this sync finished.'),
  ])
  await Promise.race([closed, new Promise(resolve => setTimeout(resolve, 5_000))])
}
process.once('SIGTERM', () => void gracefulShutdown())
process.once('SIGINT', () => void gracefulShutdown())
