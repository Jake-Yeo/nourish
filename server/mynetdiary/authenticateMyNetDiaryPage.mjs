export async function authenticateMyNetDiaryPage(page, accountName, password) {
  if (!page.url().includes('logonPage.do') && !await page.locator('#password').count()) return
  await page.locator('#username-or-email').fill(accountName)
  await page.locator('#password').fill(password)
  const rememberLoginControl = page.getByText('Remember me on this computer', { exact: false })
  if (await rememberLoginControl.count()) await rememberLoginControl.click()
  await Promise.all([
    page.waitForURL(url => !url.pathname.includes('logonPage.do'), { timeout: 45_000 }),
    page.getByRole('button', { name: 'SIGN IN', exact: true }).click(),
  ])
  await page.waitForLoadState('networkidle', { timeout: 45_000 })
  if (page.url().includes('logonPage.do') || await page.locator('#password').count()) throw createHttpError('MyNetDiary rejected the saved login. Update it under Goals and try again.', 401)
}
import { createHttpError } from '../errors/createHttpError.mjs'
