import { readAppState } from '../../database/readAppState.mjs'

export function getApplicationData(_request, response) {
  const applicationState = readAppState()
  if (!applicationState) return response.status(404).json({ error: 'Nourish has not initialized its database yet.' })
  response.json(applicationState)
}
