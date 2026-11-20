/**
 * Collect Vitest suite counts (+ merged coverage) for the docs testing page.
 *
 * Usage:
 *   node scripts/collect-test-stats.mjs              # run suites, write real stats
 *   node scripts/collect-test-stats.mjs --placeholder # write stub if missing (docs:dev)
 *
 * Output: docs/data/test-stats.json
 */
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'docs/data')
const outFile = join(outDir, 'test-stats.json')
const reportsDir = join(root, 'reports/test-stats')

const placeholder = process.argv.includes('--placeholder')

function emptyStats(isPlaceholder) {
  return {
    generatedAt: null,
    placeholder: isPlaceholder,
    total: 0,
    suites: { unit: 0, vue3: 0, vue2: 0 },
    coverage: { lines: 0, statements: 0, functions: 0, branches: 0 },
  }
}

function writeStats(stats) {
  mkdirSync(outDir, { recursive: true })
  writeFileSync(outFile, `${JSON.stringify(stats, null, 2)}\n`, 'utf8')
  console.log(`[collect-test-stats] wrote ${relative(root, outFile)}`)
}

if (placeholder) {
  if (!existsSync(outFile)) {
    writeStats(emptyStats(true))
  }
  process.exit(0)
}

function run(label, command, args) {
  console.log(`[collect-test-stats] ${label}`)
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: 'inherit',
    env: process.env,
    shell: false,
  })
  if (result.status !== 0) {
    console.error(`[collect-test-stats] ${label} failed (exit ${result.status ?? 1})`)
    process.exit(result.status ?? 1)
  }
}

function readVitestJson(file) {
  if (!existsSync(file)) {
    console.error(`[collect-test-stats] missing report ${relative(root, file)}`)
    process.exit(1)
  }
  const report = JSON.parse(readFileSync(file, 'utf8'))
  const total = Number(report.numTotalTests ?? 0)
  const failed = Number(report.numFailedTests ?? 0)
  if (report.success === false || failed > 0) {
    console.error(
      `[collect-test-stats] ${relative(root, file)} has failures (failed=${failed}, success=${report.success})`,
    )
    process.exit(1)
  }
  return total
}

function readCoverage() {
  const summaryFile = join(root, 'coverage/coverage-summary.json')
  if (!existsSync(summaryFile)) {
    console.error(`[collect-test-stats] missing ${relative(root, summaryFile)}`)
    process.exit(1)
  }
  const summary = JSON.parse(readFileSync(summaryFile, 'utf8'))
  const total = summary.total
  if (!total) {
    console.error('[collect-test-stats] coverage-summary.json missing total')
    process.exit(1)
  }
  return {
    lines: total.lines.pct,
    statements: total.statements.pct,
    functions: total.functions.pct,
    branches: total.branches.pct,
  }
}

mkdirSync(reportsDir, { recursive: true })

const unitReport = join(reportsDir, 'unit.json')
const vue3Report = join(reportsDir, 'vue3.json')
const vue2Report = join(reportsDir, 'vue2.json')

// Dist integration needs a fresh build; coverage:all also rebuilds attribution against src.
run('build', 'pnpm', ['build'])

run('unit (json)', 'pnpm', [
  'exec',
  'vitest',
  'run',
  '--reporter=default',
  '--reporter=json',
  `--outputFile=${unitReport}`,
])

run('vue3 integration (json)', 'pnpm', [
  '--filter',
  'tests-vue3',
  'exec',
  'vitest',
  'run',
  '--reporter=default',
  '--reporter=json',
  `--outputFile=${vue3Report}`,
])

run('vue2 integration (json)', 'pnpm', [
  '--filter',
  'tests-vue2',
  'exec',
  'vitest',
  'run',
  '--reporter=default',
  '--reporter=json',
  `--outputFile=${vue2Report}`,
])

run('coverage:all', 'pnpm', ['test:coverage:all'])

const suites = {
  unit: readVitestJson(unitReport),
  vue3: readVitestJson(vue3Report),
  vue2: readVitestJson(vue2Report),
}

const stats = {
  generatedAt: new Date().toISOString(),
  placeholder: false,
  total: suites.unit + suites.vue3 + suites.vue2,
  suites,
  coverage: readCoverage(),
}

writeStats(stats)
console.log(
  `[collect-test-stats] total=${stats.total} (unit=${suites.unit}, vue3=${suites.vue3}, vue2=${suites.vue2}); lines=${stats.coverage.lines}%`,
)
