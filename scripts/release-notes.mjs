/**
 * Print the CHANGELOG.md section of a version, used as GitHub Release notes.
 * Appends a compare link from the link references at the bottom of CHANGELOG.md.
 *
 * Usage: node scripts/release-notes.mjs <version>
 *   version  e.g. 1.2.3 / v1.2.3 / 1.0.0-beta.5
 *   exit 1 if the section is missing or empty
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const version = (process.argv[2] || '').replace(/^v/, '')
if (!version) {
  console.error('Usage: node scripts/release-notes.mjs <version>')
  process.exit(1)
}

const lines = readFileSync(join(root, 'CHANGELOG.md'), 'utf8').split('\n')
const isLinkRef = (line) => /^\[[^\]]+\]:\s/.test(line)

const start = lines.findIndex((line) => line.startsWith(`## [${version}]`))
if (start === -1) {
  console.error(`CHANGELOG.md has no section for ${version}`)
  process.exit(1)
}

const body = []
for (const line of lines.slice(start + 1)) {
  if (line.startsWith('## [') || isLinkRef(line)) break
  body.push(line)
}

const notes = body.join('\n').trim()
if (!notes) {
  console.error(`CHANGELOG.md section for ${version} is empty`)
  process.exit(1)
}

const link = lines.find((line) => line.startsWith(`[${version}]: `))
const compare = link ? `\n\n**Full Changelog**: ${link.slice(version.length + 4).trim()}` : ''

process.stdout.write(notes + compare + '\n')
