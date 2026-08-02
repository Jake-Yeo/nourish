import { applyDataMutation } from '../../database/applyDataMutation.mjs'
import { readAppState } from '../../database/readAppState.mjs'
import { writeAppState } from '../../database/writeAppState.mjs'

export function mutateApplicationData(request, response) {
  const currentData = readAppState()?.data
  if (!currentData) return response.status(409).json({ error: 'Nourish database is not initialized.' })
  const updatedData = applyDataMutation(currentData, request.body)
  if (!updatedData) return response.status(400).json({ error: 'Invalid Nourish data mutation.' })
  response.json(writeAppState(updatedData))
}
