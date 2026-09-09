#!/usr/bin/env node
/**
 * Fails if the English and Sinhala locale files diverge in key sets.
 * Run: yarn i18n:check
 */
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'locales')

function flatten(obj, prefix = '') {
  const out = []
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k
    if (v && typeof v === 'object' && !Array.isArray(v)) out.push(...flatten(v, key))
    else out.push(key)
  }
  return out
}

const namespaces = readdirSync(join(root, 'en'))
  .filter((f) => f.endsWith('.json'))
  .map((f) => f.replace('.json', ''))

let failed = false
for (const ns of namespaces) {
  const en = new Set(flatten(JSON.parse(readFileSync(join(root, 'en', `${ns}.json`), 'utf8'))))
  const si = new Set(flatten(JSON.parse(readFileSync(join(root, 'si', `${ns}.json`), 'utf8'))))
  const missingInSi = [...en].filter((k) => !si.has(k))
  const missingInEn = [...si].filter((k) => !en.has(k))
  if (missingInSi.length || missingInEn.length) {
    failed = true
    console.error(`\n[${ns}]`)
    missingInSi.forEach((k) => console.error(`  missing in si: ${k}`))
    missingInEn.forEach((k) => console.error(`  missing in en: ${k}`))
  }
}

if (failed) {
  console.error('\ni18n check failed — key sets differ.')
  process.exit(1)
}
console.log(`i18n check passed (${namespaces.length} namespaces, en/si in sync).`)
