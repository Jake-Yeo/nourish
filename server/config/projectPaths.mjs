import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
export const dataDirectory = path.join(projectRoot, 'data')
export const distributionDirectory = path.join(projectRoot, 'dist')
