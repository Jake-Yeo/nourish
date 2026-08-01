import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import fs from 'node:fs/promises'
import os from 'node:os'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import XLSX from 'xlsx'
import { chromium } from 'playwright-core'

if (process.env.NOURISH_ENV_FILE) dotenv.config({ path: process.env.NOURISH_ENV_FILE, quiet: true })

const app = express()
const port = Number(process.env.PORT || 4174)
const root = path.dirname(fileURLToPath(import.meta.url))
const execFileAsync = promisify(execFile)
const myNetDiaryKeychainService = 'com.ithacus.nourish.mynetdiary'
const myNetDiaryEmailService = `${myNetDiaryKeychainService}.email`
const myNetDiaryExportUrl = 'https://www.mynetdiary.com/analysisNavigator.do?selectedItem=dataExport'
const headlessShellPath = chromium.executablePath().replace(
  /\/chromium-(\d+)\/.*$/,
  '/chromium_headless_shell-$1/chrome-headless-shell-mac-arm64/chrome-headless-shell',
)

app.use(express.json({ limit: '36mb' }))

const nutrientSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    calories: { type: 'number' }, protein: { type: 'number' }, carbs: { type: 'number' },
    fat: { type: 'number' }, fiber: { type: 'number' }, sugar: { type: 'number' },
    sodium: { type: 'number' }, saturatedFat: { type: 'number' }, cholesterol: { type: 'number' },
    potassium: { type: 'number' }, calcium: { type: 'number' }, iron: { type: 'number' },
  },
  required: ['calories', 'protein', 'carbs', 'fat', 'fiber', 'sugar', 'sodium', 'saturatedFat', 'cholesterol', 'potassium', 'calcium', 'iron'],
}

app.get('/api/health', (_request, response) => {
  response.json({ ok: true, visionConfigured: Boolean(process.env.OPENAI_API_KEY), model: process.env.OPENAI_VISION_MODEL || 'gpt-5.6-luna' })
})

const numberValue = value => Number.isFinite(Number(value)) ? Number(value) : 0
const myNetDiaryDate = value => {
  const match = String(value).match(/^(\d{1,2})\s+(\d{1,2})\s+(\d{4})(?:\s+(\d{1,2}):(\d{2})\s+([AP]M))?/i)
  if (!match) return null
  const [, day, month, year, rawHour = '12', minute = '00', meridiem = 'AM'] = match
  let hour = Number(rawHour) % 12
  if (meridiem.toUpperCase() === 'PM') hour += 12
  return { date: `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`, timestamp: new Date(Number(year), Number(month) - 1, Number(day), hour, Number(minute)).getTime() }
}
const mealValue = value => {
  const meal = String(value).toLowerCase()
  if (meal.startsWith('break')) return 'Breakfast'
  if (meal.startsWith('lunch')) return 'Lunch'
  if (meal.startsWith('dinner') || meal.startsWith('supper')) return 'Dinner'
  return 'Snacks'
}

const readKeychainSecret = async service => {
  try {
    const { stdout } = await execFileAsync('/usr/bin/security', ['find-generic-password', '-a', 'nourish', '-s', service, '-w'], { timeout: 10_000 })
    return stdout.trim()
  } catch { return '' }
}

const saveKeychainSecret = (service, value) => execFileAsync(
  '/usr/bin/security', ['add-generic-password', '-U', '-a', 'nourish', '-s', service, '-w', value], { timeout: 10_000 },
)

app.get('/api/mynetdiary-credentials', async (_request, response) => {
  const [email, password] = await Promise.all([readKeychainSecret(myNetDiaryEmailService), readKeychainSecret(myNetDiaryKeychainService)])
  response.json({ configured: Boolean(email && password), emailHint: email ? email.replace(/^(.{1,2}).*(@.*)$/, '$1•••$2') : '' })
})

app.post('/api/mynetdiary-credentials', async (request, response) => {
  const email = String(request.body?.email || '').trim()
  const password = String(request.body?.password || '')
  if (!email || !password) return response.status(400).json({ error: 'Enter your MyNetDiary email and password.' })
  await saveKeychainSecret(myNetDiaryEmailService, email)
  await saveKeychainSecret(myNetDiaryKeychainService, password)
  response.json({ configured: true, emailHint: email.replace(/^(.{1,2}).*(@.*)$/, '$1•••$2') })
})

app.post('/api/sync-mynetdiary', async (_request, response) => {
  let browser
  let temporaryDirectory
  try {
    const requestedAt = Date.now()
    const [email, password] = await Promise.all([readKeychainSecret(myNetDiaryEmailService), readKeychainSecret(myNetDiaryKeychainService)])
    if (!email || !password) return response.status(409).json({ error: 'Add your MyNetDiary login under Goals before syncing.' })

    temporaryDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'nourish-mynetdiary-'))
    await fs.access(headlessShellPath)
    browser = await chromium.launch({ headless: true, executablePath: headlessShellPath })
    const page = await browser.newPage({ acceptDownloads: true })
    await page.goto(myNetDiaryExportUrl, { waitUntil: 'networkidle', timeout: 45_000 })

    if (page.url().includes('logonPage.do') || await page.locator('#password').count()) {
      await page.locator('#username-or-email').fill(email)
      await page.locator('#password').fill(password)
      const remember = page.getByText('Remember me on this computer', { exact: false })
      if (await remember.count()) await remember.click()
      await Promise.all([
        page.waitForURL(url => !url.pathname.includes('logonPage.do'), { timeout: 45_000 }),
        page.getByRole('button', { name: 'SIGN IN', exact: true }).click(),
      ])
      await page.waitForLoadState('networkidle', { timeout: 45_000 })
      if (page.url().includes('logonPage.do') || await page.locator('#password').count()) {
        return response.status(401).json({ error: 'MyNetDiary rejected the saved login. Update it under Goals and try again.' })
      }
    }

    if (!page.url().includes('analysisNavigator.do')) await page.goto(myNetDiaryExportUrl, { waitUntil: 'networkidle', timeout: 45_000 })
    const exportYear = String(new Date().getFullYear())
    await page.locator('select, input').evaluateAll((controls, year) => {
      for (const control of controls) {
        const key = `${control.getAttribute('name') || ''} ${control.id || ''} ${control.getAttribute('aria-label') || ''}`.toLowerCase()
        if (!key.includes('year')) continue
        control.value = year
        control.dispatchEvent(new Event('change', { bubbles: true }))
      }
    }, exportYear)
    const exportControl = page.locator('a, button, input[type="submit"], input[type="button"]').filter({ hasText: /export|download/i }).first()
    const directExport = page.locator(`a[href*="exportData.do"][href*="${exportYear}"], a[href*="exportData.do"]`).first()
    const target = await directExport.count() ? directExport : exportControl
    if (!await target.count()) throw new Error('MyNetDiary changed its export page; the download control could not be found.')
    const downloadPromise = page.waitForEvent('download', { timeout: 60_000 })
    await target.click()
    const download = await downloadPromise
    const downloadError = await download.failure()
    if (downloadError) throw new Error(`MyNetDiary download failed: ${downloadError}`)
    const latest = { name: download.suggestedFilename(), modified: requestedAt }
    if (!/^MyNetDiary.*\.(xls|xlsx)$/i.test(latest.name)) throw new Error(`Unexpected MyNetDiary download: ${latest.name}`)
    const downloadedPath = path.join(temporaryDirectory, latest.name)
    await download.saveAs(downloadedPath)
    const workbook = XLSX.readFile(downloadedPath, { cellDates: false })
    const sheet = workbook.Sheets.Food
    if (!sheet) throw new Error('The MyNetDiary workbook has no Food sheet.')
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: null, raw: false })
    const occurrences = new Map()
    const entries = rows.flatMap(row => {
      const parsedDate = myNetDiaryDate(row['Date & Time'])
      if (!parsedDate || !row.Name) return []
      const baseId = [parsedDate.date, row['Date & Time'], row.Meal, row['Food ID'], row.Amount].join('|')
      const occurrence = occurrences.get(baseId) || 0
      occurrences.set(baseId, occurrence + 1)
      const externalId = `${baseId}|${occurrence}`
      const amount = String(row.Amount || '1 serving')
      const grams = Number(amount.match(/([\d.]+)\s*g\b/i)?.[1] || 0)
      const nutrients = {
        calories: numberValue(row['Calories, cals']), protein: numberValue(row['Protein, g']), carbs: numberValue(row['Total Carbs, g']),
        fat: numberValue(row['Total Fat, g']), fiber: numberValue(row['Dietary Fiber, g']), sugar: numberValue(row['Total Sugars, g']),
        sodium: numberValue(row['Sodium, mg']), saturatedFat: numberValue(row['Saturated Fat, g']), cholesterol: numberValue(row['Cholesterol, mg']),
        potassium: numberValue(row['Potassium, mg']), calcium: numberValue(row['Calcium, mg']), iron: numberValue(row['Iron, mg']),
      }
      return [{
        id: `mynetdiary-${Buffer.from(externalId).toString('base64url')}`, date: parsedDate.date, meal: mealValue(row.Meal), servings: 1,
        loggedAt: parsedDate.timestamp, source: 'mynetdiary', externalId,
        food: { id: `mynetdiary-food-${row['Food ID'] || Buffer.from(String(row.Name)).toString('base64url')}`, name: String(row.Name), servingLabel: amount, servingGrams: grams, nutrients, source: 'custom' },
      }]
    })

    // Keep exactly one validated private export in the project. Moving the new
    // file first ensures an invalid download never replaces the last good one.
    const exportDirectory = path.join(root, 'data', 'mynetdiary')
    const extension = path.extname(latest.name).toLowerCase()
    const incomingName = `.incoming-${requestedAt}${extension}`
    const incomingPath = path.join(exportDirectory, incomingName)
    const storedName = `MyNetDiary-latest${extension}`
    const storedPath = path.join(exportDirectory, storedName)
    await fs.mkdir(exportDirectory, { recursive: true })
    await fs.rename(downloadedPath, incomingPath)
    const previousFiles = await fs.readdir(exportDirectory, { withFileTypes: true })
    await Promise.all(previousFiles
      .filter(item => item.isFile() && item.name !== incomingName)
      .map(item => fs.rm(path.join(exportDirectory, item.name))))
    await fs.rename(incomingPath, storedPath)

    response.json({ entries, exportYear, file: storedName, exportedAt: latest.modified, fresh: true })
  } catch (error) {
    response.status(500).json({ error: error instanceof Error ? error.message : 'Could not import MyNetDiary data.' })
  } finally {
    await browser?.close().catch(() => {})
    if (temporaryDirectory) await fs.rm(temporaryDirectory, { recursive: true, force: true }).catch(() => {})
  }
})

app.post('/api/analyze-meal', async (request, response) => {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return response.status(503).json({ error: 'AI meal analysis is not configured yet. Add OPENAI_API_KEY to the Nourish launch environment.' })
  const photos = Array.isArray(request.body?.photos) ? request.body.photos.slice(0, 6) : []
  if (!photos.length) return response.status(400).json({ error: 'Add at least one meal photo.' })
  const content = [{
    type: 'input_text',
    text: `Estimate this meal for a nutrition diary. Analyze all photos as different views or components of ONE meal, not separate meals. Use the user's notes to resolve portion size, ingredients, meat cut, sauces, preparation, and whether an item was fully eaten. Avoid double counting food visible in multiple angles. Give realistic point estimates, not ranges. Be conservative about visual certainty and explicitly mention important assumptions. Overall meal note: ${String(request.body?.note || 'None')}`,
  }]
  photos.forEach((photo, index) => {
    content.push({ type: 'input_text', text: `Photo ${index + 1} note: ${String(photo.note || 'No note')}` })
    content.push({ type: 'input_image', image_url: String(photo.dataUrl), detail: 'high' })
  })

  try {
    const apiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.OPENAI_VISION_MODEL || 'gpt-5.6-luna',
        reasoning: { effort: 'low' },
        input: [{ role: 'user', content }],
        text: {
          format: {
            type: 'json_schema', name: 'meal_nutrition_estimate', strict: true,
            schema: {
              type: 'object', additionalProperties: false,
              properties: {
                mealName: { type: 'string' },
                confidence: { type: 'string', enum: ['low', 'medium', 'high'] },
                summary: { type: 'string' }, assumptions: { type: 'array', items: { type: 'string' } },
                items: {
                  type: 'array', minItems: 1,
                  items: {
                    type: 'object', additionalProperties: false,
                    properties: { name: { type: 'string' }, portion: { type: 'string' }, nutrients: nutrientSchema },
                    required: ['name', 'portion', 'nutrients'],
                  },
                },
                totals: nutrientSchema,
              },
              required: ['mealName', 'confidence', 'summary', 'assumptions', 'items', 'totals'],
            },
          },
        },
      }),
    })
    const payload = await apiResponse.json()
    if (!apiResponse.ok) return response.status(apiResponse.status).json({ error: payload?.error?.message || 'OpenAI could not analyze the meal.' })
    const outputText = payload.output_text || payload.output?.flatMap(item => item.content || []).find(item => item.type === 'output_text')?.text
    if (!outputText) throw new Error('The model returned no nutrition estimate.')
    response.json(JSON.parse(outputText))
  } catch (error) {
    response.status(500).json({ error: error instanceof Error ? error.message : 'Meal analysis failed.' })
  }
})

app.use(express.static(path.join(root, 'dist'), { maxAge: '1h' }))
app.get('*path', (_request, response) => response.sendFile(path.join(root, 'dist', 'index.html')))
app.listen(port, '127.0.0.1', () => console.log(`Nourish running at http://127.0.0.1:${port}`))
