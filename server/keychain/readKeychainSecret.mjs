import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const executeFile = promisify(execFile)

export async function readKeychainSecret(serviceName) {
  try {
    const { stdout } = await executeFile('/usr/bin/security', ['find-generic-password', '-a', 'nourish', '-s', serviceName, '-w'], { timeout: 10_000 })
    return stdout.trim()
  } catch {
    return ''
  }
}
