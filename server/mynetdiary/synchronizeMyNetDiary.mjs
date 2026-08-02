import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { chromium } from 'playwright-core'
import { runtimeConfiguration } from '../config/runtimeConfiguration.mjs'
import { createHttpError } from '../errors/createHttpError.mjs'
import { readKeychainSecret } from '../keychain/readKeychainSecret.mjs'
import { authenticateMyNetDiaryPage } from './authenticateMyNetDiaryPage.mjs'
import { downloadMyNetDiaryWorkbook } from './downloadMyNetDiaryWorkbook.mjs'
import { parseMyNetDiaryWorkbook } from './parseMyNetDiaryWorkbook.mjs'
import { selectMyNetDiaryExportYear } from './selectMyNetDiaryExportYear.mjs'
import { storeLatestMyNetDiaryWorkbook } from './storeLatestMyNetDiaryWorkbook.mjs'

export async function synchronizeMyNetDiary() {
  let headlessBrowser
  let temporaryDirectory
  try {
    const requestedAt = Date.now()
    const [accountName, password] = await Promise.all([readKeychainSecret(runtimeConfiguration.myNetDiaryEmailService), readKeychainSecret(runtimeConfiguration.myNetDiaryPasswordService)])
    if (!accountName || !password) throw createHttpError('Add your MyNetDiary login under Goals before syncing.', 409)
    temporaryDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'nourish-mynetdiary-'))
    await fs.access(runtimeConfiguration.headlessBrowserPath)
    headlessBrowser = await chromium.launch({ headless: true, executablePath: runtimeConfiguration.headlessBrowserPath })
    const exportPage = await headlessBrowser.newPage({ acceptDownloads: true })
    await exportPage.goto(runtimeConfiguration.myNetDiaryExportUrl, { waitUntil: 'networkidle', timeout: 45_000 })
    await authenticateMyNetDiaryPage(exportPage, accountName, password)
    if (!exportPage.url().includes('analysisNavigator.do')) await exportPage.goto(runtimeConfiguration.myNetDiaryExportUrl, { waitUntil: 'networkidle', timeout: 45_000 })
    const exportYear = String(new Date().getFullYear())
    await selectMyNetDiaryExportYear(exportPage, exportYear)
    const downloadedWorkbook = await downloadMyNetDiaryWorkbook(exportPage, temporaryDirectory, exportYear)
    const importedEntries = parseMyNetDiaryWorkbook(downloadedWorkbook.workbookPath)
    const storedFileName = await storeLatestMyNetDiaryWorkbook(downloadedWorkbook.workbookPath, downloadedWorkbook.fileName, requestedAt)
    return { entries: importedEntries, exportYear, file: storedFileName, exportedAt: requestedAt, fresh: true }
  } finally {
    await headlessBrowser?.close().catch(() => undefined)
    if (temporaryDirectory) await fs.rm(temporaryDirectory, { recursive: true, force: true }).catch(() => undefined)
  }
}
