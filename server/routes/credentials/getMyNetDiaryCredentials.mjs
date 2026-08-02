import { runtimeConfiguration } from '../../config/runtimeConfiguration.mjs'
import { getMaskedAccountName } from '../../keychain/getMaskedAccountName.mjs'
import { readKeychainSecret } from '../../keychain/readKeychainSecret.mjs'

export async function getMyNetDiaryCredentials(_request, response) {
  const [accountName, password] = await Promise.all([readKeychainSecret(runtimeConfiguration.myNetDiaryEmailService), readKeychainSecret(runtimeConfiguration.myNetDiaryPasswordService)])
  response.json({ configured: Boolean(accountName && password), emailHint: getMaskedAccountName(accountName) })
}
