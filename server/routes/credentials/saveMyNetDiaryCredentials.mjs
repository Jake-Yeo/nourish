import { runtimeConfiguration } from '../../config/runtimeConfiguration.mjs'
import { getMaskedAccountName } from '../../keychain/getMaskedAccountName.mjs'
import { saveKeychainSecret } from '../../keychain/saveKeychainSecret.mjs'

export async function saveMyNetDiaryCredentials(request, response) {
  const accountName = String(request.body?.email || '').trim()
  const password = String(request.body?.password || '')
  if (!accountName || !password) return response.status(400).json({ error: 'Enter your MyNetDiary email and password.' })
  await saveKeychainSecret(runtimeConfiguration.myNetDiaryEmailService, accountName)
  await saveKeychainSecret(runtimeConfiguration.myNetDiaryPasswordService, password)
  response.json({ configured: true, emailHint: getMaskedAccountName(accountName) })
}
