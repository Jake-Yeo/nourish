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
import { synchronizeMyNetDiaryRoute } from './server/routes/sync/synchronizeMyNetDiaryRoute.mjs'
import { analyzeMeal } from './server/routes/vision/analyzeMeal.mjs'
import { askDayQuestion } from './server/routes/vision/askDayQuestion.mjs'

const application = express()
application.use(express.json({ limit: '36mb' }))
application.get('/api/health', getHealthStatus)
application.get('/api/data', getApplicationData)
application.post('/api/data/bootstrap', bootstrapApplicationData)
application.post('/api/data/mutate', mutateApplicationData)
application.get('/api/mynetdiary-credentials', getMyNetDiaryCredentials)
application.post('/api/mynetdiary-credentials', saveMyNetDiaryCredentials)
application.post('/api/sync-mynetdiary', synchronizeMyNetDiaryRoute)
application.post('/api/analyze-meal', analyzeMeal)
application.post('/api/ask-day-question', askDayQuestion)
application.use((error, _request, response, next) => {
  if (error?.type === 'entity.too.large') return response.status(413).json({ error: 'That request is too large.' })
  next(error)
})
application.use(express.static(distributionDirectory, { maxAge: '1h' }))
application.get('*path', (_request, response) => response.sendFile(path.join(distributionDirectory, 'index.html')))
application.listen(runtimeConfiguration.port, '127.0.0.1', () => console.log(`Nourish running at http://127.0.0.1:${runtimeConfiguration.port}`))
