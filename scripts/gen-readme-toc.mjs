/**
 * Generate README table of contents between `<!-- toc -->` and `<!-- tocstop -->`.
 * Only headings after the toc block are listed; anchors follow GitHub's slug rules.
 *
 * Usage: node scripts/gen-readme-toc.mjs [--check]
 *   --check  exit 1 if any README is out of date (no write)
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const FILES = ['README.md', 'README.en.md']
const START = '<!-- toc -->'
const END = '<!-- tocstop -->'
const MIN_LEVEL = 2
const MAX_LEVEL = 3

const check = process.argv.includes('--check')

function plainText(text) {
  return text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/[`*_~]/g, '')
    .trim()
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\p{Pc}\- ]/gu, '')
    .replace(/ /g, '-')
}

function collectHeadings(markdown) {
  const headings = []
  const seen = new Map()
  let fence = null
  for (const line of markdown.split('\n')) {
    const fenceMatch = line.match(/^\s*(`{3,}|~{3,})/)
    if (fenceMatch) {
      if (!fence) fence = fenceMatch[1]
      else if (fenceMatch[1][0] === fence[0] && fenceMatch[1].length >= fence.length) fence = null
      continue
    }
    if (fence) continue
    const match = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/)
    if (!match) continue
    const text = plainText(match[2])
    const base = slugify(text)
    const count = seen.get(base) ?? 0
    seen.set(base, count + 1)
    headings.push({ level: match[1].length, text, slug: count ? `${base}-${count}` : base })
  }
  return headings
}

function render(markdown) {
  const start = markdown.indexOf(START)
  const end = markdown.indexOf(END)
  if (start === -1 || end === -1 || end < start) return null

  // Slug dedupe counts span the whole document, so collect from the start.
  const headings = collectHeadings(markdown)
  const headingsBeforeToc = collectHeadings(markdown.slice(0, end)).length

  const toc = headings
    .slice(headingsBeforeToc)
    .filter((h) => h.level >= MIN_LEVEL && h.level <= MAX_LEVEL)
    .map((h) => `${'  '.repeat(h.level - MIN_LEVEL)}- [${h.text}](#${h.slug})`)
    .join('\n')

  return `${markdown.slice(0, start)}${START}\n\n${toc}\n\n${markdown.slice(end)}`
}

let stale = false
for (const file of FILES) {
  const path = join(root, file)
  if (!existsSync(path)) continue
  const source = readFileSync(path, 'utf8')
  const next = render(source)
  if (next === null || next === source) continue
  stale = true
  if (check) console.error(`${file}: toc is out of date, run \`pnpm readme:toc\``)
  else {
    writeFileSync(path, next)
    console.log(`${file}: toc updated`)
  }
}

if (check && stale) process.exit(1)
