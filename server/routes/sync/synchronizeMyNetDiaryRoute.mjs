import { synchronizeMyNetDiary } from '../../mynetdiary/synchronizeMyNetDiary.mjs'

export async function synchronizeMyNetDiaryRoute(_request, response) {
  try {
    response.json(await synchronizeMyNetDiary())
  } catch (error) {
    response.status(Number(error?.statusCode) || 500).json({ error: error instanceof Error ? error.message : 'Could not import MyNetDiary data.' })
  }
}
