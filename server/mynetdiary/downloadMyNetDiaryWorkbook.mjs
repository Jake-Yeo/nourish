import path from 'node:path'

export async function downloadMyNetDiaryWorkbook(page, temporaryDirectory, exportYear) {
  const exportControl = page.locator('a, button, input[type="submit"], input[type="button"]').filter({ hasText: /export|download/i }).first()
  const directExportControl = page.locator(`a[href*="exportData.do"][href*="${exportYear}"], a[href*="exportData.do"]`).first()
  const selectedExportControl = await directExportControl.count() ? directExportControl : exportControl
  if (!await selectedExportControl.count()) throw new Error('MyNetDiary changed its export page; the download control could not be found.')
  const downloadEvent = page.waitForEvent('download', { timeout: 60_000 })
  await selectedExportControl.click()
  const workbookDownload = await downloadEvent
  const downloadFailure = await workbookDownload.failure()
  if (downloadFailure) throw new Error(`MyNetDiary download failed: ${downloadFailure}`)
  const fileName = workbookDownload.suggestedFilename()
  if (!/^MyNetDiary.*\.(xls|xlsx)$/i.test(fileName)) throw new Error(`Unexpected MyNetDiary download: ${fileName}`)
  const workbookPath = path.join(temporaryDirectory, fileName)
  await workbookDownload.saveAs(workbookPath)
  return { fileName, workbookPath }
}
