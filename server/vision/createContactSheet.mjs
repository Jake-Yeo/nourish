import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { constants as fsConstants } from 'node:fs'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const executeFile = promisify(execFile)
const executableCandidates = name => [
  ...String(process.env.PATH || '').split(path.delimiter).filter(Boolean).map(folder => path.join(folder, name)),
  `/opt/homebrew/bin/${name}`, `/usr/local/bin/${name}`, `/usr/bin/${name}`,
]

export async function findExecutable(name) {
  for (const candidate of [...new Set(executableCandidates(name))]) {
    try { await fs.access(candidate, fsConstants.X_OK); return candidate } catch {}
  }
  return null
}

function imageExtension(dataUrl) {
  return ({ jpeg: 'jpg', jpg: 'jpg', png: 'png', webp: 'webp' })[/^data:image\/(jpeg|jpg|png|webp);/.exec(dataUrl)?.[1]]
}

function buildFilter(count, columns) {
  const tiles = Array.from({ length: count }, (_, index) => `[${index}:v]scale=640:640:force_original_aspect_ratio=decrease,pad=640:640:(ow-iw)/2:(oh-ih)/2:white[t${index}]`).join(';')
  if (count === 1) return `${tiles};[t0]null[out]`
  const inputs = Array.from({ length: count }, (_, index) => `[t${index}]`).join('')
  const layout = Array.from({ length: count }, (_, index) => `${index % columns * 640}_${Math.floor(index / columns) * 640}`).join('|')
  return `${tiles};${inputs}xstack=inputs=${count}:layout=${layout}:fill=white[out]`
}

export async function createContactSheet(photos) {
  const ffmpeg = await findExecutable('ffmpeg')
  if (!ffmpeg) throw Object.assign(new Error('Meal analysis needs FFmpeg to combine multiple photo angles. Install FFmpeg and restart Nourish.'), { statusCode: 503 })
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'nourish-analysis-'))
  await fs.chmod(directory, 0o700)
  try {
    const inputs = []
    for (const [index, photo] of photos.entries()) {
      const file = path.join(directory, `angle-${index}.${imageExtension(photo.dataUrl)}`)
      await fs.writeFile(file, Buffer.from(photo.dataUrl.split(',')[1], 'base64'), { mode: 0o600 })
      inputs.push(file)
    }
    const output = path.join(directory, 'contact-sheet.jpg')
    const columns = Math.ceil(Math.sqrt(inputs.length))
    const args = inputs.flatMap(file => ['-i', file]).concat(['-filter_complex', buildFilter(inputs.length, columns), '-map', '[out]', '-frames:v', '1', '-q:v', '3', '-y', output])
    await executeFile(ffmpeg, args, { timeout: 20_000, maxBuffer: 256_000, windowsHide: true })
    await fs.chmod(output, 0o600)
    return { directory, imagePath: output }
  } catch (error) {
    await fs.rm(directory, { recursive: true, force: true })
    if (error?.statusCode) throw error
    throw Object.assign(new Error('Meal photos could not be safely combined for analysis.'), { statusCode: 502 })
  }
}
