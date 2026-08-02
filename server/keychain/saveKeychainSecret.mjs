import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const executeFile = promisify(execFile)

export function saveKeychainSecret(serviceName, secretValue) {
  return executeFile('/usr/bin/security', ['add-generic-password', '-U', '-a', 'nourish', '-s', serviceName, '-w', secretValue], { timeout: 10_000 })
}
