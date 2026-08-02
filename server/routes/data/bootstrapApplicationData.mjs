import { isValidAppData } from '../../database/isValidAppData.mjs'
import { mergeMigratedData } from '../../database/mergeMigratedData.mjs'
import { readAppState } from '../../database/readAppState.mjs'
import { writeAppState } from '../../database/writeAppState.mjs'

export function bootstrapApplicationData(request, response) {
  const storedData = readAppState()?.data
  const localData = isValidAppData(request.body?.localData) ? request.body.localData : null
  if (!storedData && !localData) return response.status(409).json({ error: 'Open Nourish once on a device containing your existing diary to initialize the database.' })
  response.json(writeAppState(localData ? mergeMigratedData(storedData, localData) : storedData))
}
