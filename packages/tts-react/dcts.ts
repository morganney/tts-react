/**
 * Creates TypeScript declarations for CommonJS consumers.
 * @see https://www.typescriptlang.org/docs/handbook/esm-node.html
 */

import { readdirSync, copyFileSync } from 'node:fs'
import { resolve } from 'node:path'

for (const dirent of readdirSync(resolve('./dist'), { withFileTypes: true })) {
  if (dirent.name.endsWith('.d.ts')) {
    copyFileSync(resolve('./dist', dirent.name), resolve('./dist/cjs', dirent.name))
  }
}
