import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const distRoot = new URL('../dist', import.meta.url).pathname
const rules = []

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const child = join(dir, entry.name)
    const redirectsFile = join(child, '_redirects')
    try {
      if (statSync(redirectsFile).isFile()) {
        rules.push(readFileSync(redirectsFile, 'utf8').trim())
      }
    } catch {}
    walk(child)
  }
}

walk(distRoot)

if (rules.length > 0) {
  writeFileSync(join(distRoot, '_redirects'), rules.join('\n') + '\n')
  console.log(`Aggregated ${rules.length} redirect rule(s) into dist/_redirects`)
} else {
  console.log('No _redirects files found in dist/')
}
