import { runtimeConfiguration } from '../../config/runtimeConfiguration.mjs'

export function getHealthStatus(_request, response) {
  response.json({ ok: true, database: 'sqlite', visionConfigured: Boolean(process.env.OPENAI_API_KEY), model: runtimeConfiguration.visionModel })
}
