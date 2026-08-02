import fs from 'node:fs/promises'
import path from 'node:path'
import { dataDirectory } from '../config/projectPaths.mjs'

export async function storeLatestMyNetDiaryWorkbook(downloadedWorkbookPath, downloadedFileName, requestedAt) {
  const exportDirectory = path.join(dataDirectory, 'mynetdiary')
  const fileExtension = path.extname(downloadedFileName).toLowerCase()
  const incomingFileName = `.incoming-${requestedAt}${fileExtension}`
  const incomingFilePath = path.join(exportDirectory, incomingFileName)
  const storedFileName = `MyNetDiary-latest${fileExtension}`
  const storedFilePath = path.join(exportDirectory, storedFileName)
  await fs.mkdir(exportDirectory, { recursive: true })
  await fs.rename(downloadedWorkbookPath, incomingFilePath)
  const previousFiles = await fs.readdir(exportDirectory, { withFileTypes: true })
  await Promise.all(previousFiles.filter(directoryEntry => directoryEntry.isFile() && directoryEntry.name !== incomingFileName).map(directoryEntry => fs.rm(path.join(exportDirectory, directoryEntry.name))))
  await fs.rename(incomingFilePath, storedFilePath)
  return storedFileName
}
