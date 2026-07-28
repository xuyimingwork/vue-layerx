/**
 * Merge unit + integration (src-alias) Istanbul JSON into ./coverage.
 *
 * Usage: node scripts/merge-coverage.mjs
 * Expects:
 *   coverage/unit/coverage-final.json
 *   coverage/integration/coverage-final.json
 *   coverage/integration-vue2/coverage-final.json
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import libCoverage from 'istanbul-lib-coverage'
import libReport from 'istanbul-lib-report'
import reports from 'istanbul-reports'

const { createCoverageMap } = libCoverage
const { createContext } = libReport
const { create: createReport } = reports

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const inputs = [
  path.join(root, 'coverage/unit/coverage-final.json'),
  path.join(root, 'coverage/integration/coverage-final.json'),
  path.join(root, 'coverage/integration-vue2/coverage-final.json'),
]
const outDir = path.join(root, 'coverage')

const map = createCoverageMap({})
for (const file of inputs) {
  if (!fs.existsSync(file)) {
    console.error(`[merge-coverage] missing ${path.relative(root, file)}`)
    process.exit(1)
  }
  map.merge(JSON.parse(fs.readFileSync(file, 'utf8')))
}

fs.mkdirSync(outDir, { recursive: true })

const context = createContext({
  dir: outDir,
  coverageMap: map,
  defaultSummarizer: 'nested',
})

for (const type of ['json', 'json-summary', 'lcov', 'html', 'text', 'text-summary']) {
  createReport(type, {}).execute(context)
}

console.log(`[merge-coverage] wrote reports under ${path.relative(root, outDir)}/`)
