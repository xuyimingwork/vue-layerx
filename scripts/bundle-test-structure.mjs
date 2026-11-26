/**
 * Bundle describe / it / test titles from Vitest files into one markdown tree
 * (no bodies) for AI review of test coverage design.
 *
 * Usage: pnpm bundle:tests
 * Output: reports/bundle/tests.md
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outFile = join(root, 'reports/bundle/tests.md')

/** @type {{ title: string, roots: string[] }[]} */
const SECTIONS = [
  { title: 'Unit', roots: ['src'] },
  { title: 'Integration (Vue 3)', roots: ['tests-vue3'] },
  { title: 'Integration (Vue 2)', roots: ['tests-vue2'] },
]

const TEST_FILE_RE = /\.(?:test|spec|test-d)\.[cm]?[jt]sx?$/

/**
 * @param {string} dir
 * @param {string[]} acc
 */
function walkFiles(dir, acc = []) {
  if (!existsSync(dir)) return acc
  for (const name of readdirSync(dir).sort()) {
    const full = join(dir, name)
    const st = statSync(full)
    if (st.isDirectory()) {
      if (name === 'node_modules' || name === 'dist' || name === 'coverage') continue
      walkFiles(full, acc)
      continue
    }
    if (TEST_FILE_RE.test(name)) acc.push(full)
  }
  return acc
}

/**
 * @param {ts.Expression | undefined} expr
 * @returns {string | null}
 */
function exprToTitle(expr) {
  if (!expr) return null
  if (ts.isStringLiteral(expr) || ts.isNoSubstitutionTemplateLiteral(expr)) {
    return expr.text
  }
  if (ts.isTemplateExpression(expr)) {
    let out = expr.head.text
    for (const span of expr.templateSpans) {
      out += `\${…}${span.literal.text}`
    }
    return out
  }
  if (ts.isIdentifier(expr)) return expr.text
  if (ts.isPropertyAccessExpression(expr)) {
    return expr.getText()
  }
  return expr.getText().replace(/\s+/g, ' ').slice(0, 80)
}

/**
 * @param {ts.Expression} expr
 * @returns {{ kind: 'describe' | 'it' | 'test', modifiers: string[] } | null}
 */
function matchSuiteCall(expr) {
  /** @type {string[]} */
  const parts = []
  let cur = expr
  while (ts.isPropertyAccessExpression(cur)) {
    parts.unshift(cur.name.text)
    cur = cur.expression
  }
  if (!ts.isIdentifier(cur)) return null
  parts.unshift(cur.text)

  const kind = parts[0]
  if (kind !== 'describe' && kind !== 'it' && kind !== 'test') return null
  return { kind, modifiers: parts.slice(1) }
}

/**
 * @param {ts.Expression | undefined} expr
 */
function isTitleLike(expr) {
  return (
    !!expr &&
    (ts.isStringLiteral(expr) ||
      ts.isNoSubstitutionTemplateLiteral(expr) ||
      ts.isTemplateExpression(expr))
  )
}

/**
 * Resolve `describe` / `it` / `test` / `it.each(table)('…')` calls.
 * @param {ts.CallExpression} node
 * @returns {{ meta: { kind: 'describe' | 'it' | 'test', modifiers: string[] }, title: string } | 'skip-inner-each' | null}
 */
function resolveSuiteCall(node) {
  const direct = matchSuiteCall(node.expression)
  if (direct) {
    const isTable =
      direct.modifiers.includes('each') || direct.modifiers.includes('for')
    // Bare `it.each(table)` — wait for the outer call that holds the title.
    if (isTable && !isTitleLike(node.arguments[0])) return 'skip-inner-each'
    return {
      meta: direct,
      title: exprToTitle(node.arguments[0]) ?? '(unnamed)',
    }
  }

  // Outer form: it.each(table)('title', fn)
  if (ts.isCallExpression(node.expression)) {
    const inner = matchSuiteCall(node.expression.expression)
    if (
      inner &&
      (inner.modifiers.includes('each') || inner.modifiers.includes('for')) &&
      isTitleLike(node.arguments[0])
    ) {
      return {
        meta: inner,
        title: exprToTitle(node.arguments[0]) ?? '(unnamed)',
      }
    }
  }

  return null
}

/**
 * @typedef {{ label: string, title: string, children: Node[] }} Node
 */

/**
 * @param {string} source
 * @param {string} fileName
 * @returns {Node[]}
 */
function extractStructure(source, fileName) {
  const sf = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  /** @type {Node[]} */
  const roots = []
  /** @type {Node[]} */
  const stack = []

  /**
   * @param {ts.Node} node
   */
  function visit(node) {
    if (ts.isCallExpression(node)) {
      const resolved = resolveSuiteCall(node)
      if (resolved === 'skip-inner-each') {
        ts.forEachChild(node, visit)
        return
      }
      if (resolved) {
        const label = [resolved.meta.kind, ...resolved.meta.modifiers].join('.')
        /** @type {Node} */
        const entry = { label, title: resolved.title, children: [] }
        const parent = stack[stack.length - 1]
        if (parent) parent.children.push(entry)
        else roots.push(entry)

        if (resolved.meta.kind === 'describe') {
          stack.push(entry)
          ts.forEachChild(node, visit)
          stack.pop()
          return
        }

        // it/test: do not descend (avoid nested helpers that call test())
        return
      }
    }
    ts.forEachChild(node, visit)
  }

  visit(sf)
  return roots
}

/**
 * @param {Node[]} nodes
 * @param {number} indent
 * @param {string[]} lines
 */
function renderNodes(nodes, indent, lines) {
  const pad = '  '.repeat(indent)
  for (const node of nodes) {
    lines.push(`${pad}${node.label}(${JSON.stringify(node.title)})`)
    if (node.children.length) {
      lines.push(`${pad}{`)
      renderNodes(node.children, indent + 1, lines)
      lines.push(`${pad}}`)
    }
  }
}

/**
 * @param {string} filePath
 * @param {Node[]} nodes
 */
function renderFile(filePath, nodes) {
  const rel = relative(root, filePath).replace(/\\/g, '/')
  const lines = [`### \`${rel}\``, '']
  if (!nodes.length) {
    lines.push('_（未解析到 describe / it / test）_', '')
    return lines
  }
  lines.push('```ts')
  renderNodes(nodes, 0, lines)
  lines.push('```', '')
  return lines
}

function main() {
  /** @type {string[]} */
  const out = [
    '# Test Structure Bundle',
    '',
    '> 由 `pnpm bundle:tests`（`scripts/bundle-test-structure.mjs`）生成：仅保留 `describe` / `it` / `test` 标题树，不含用例实现。',
    '',
    `> generatedAt: ${new Date().toISOString()}`,
    '',
  ]

  let fileCount = 0
  let caseCount = 0

  /**
   * @param {Node[]} nodes
   */
  function countCases(nodes) {
    let n = 0
    for (const node of nodes) {
      if (node.label.startsWith('it') || node.label.startsWith('test')) n += 1
      n += countCases(node.children)
    }
    return n
  }

  for (const section of SECTIONS) {
    /** @type {string[]} */
    const files = []
    for (const r of section.roots) {
      walkFiles(join(root, r), files)
    }
    if (!files.length) continue

    out.push(`## ${section.title}`, '')

    for (const file of files) {
      const source = readFileSync(file, 'utf8')
      const nodes = extractStructure(source, file)
      fileCount += 1
      caseCount += countCases(nodes)
      out.push(...renderFile(file, nodes))
    }
  }

  out.splice(
    5,
    0,
    `> files: ${fileCount} · cases (it/test): ${caseCount}`,
    '',
  )

  mkdirSync(dirname(outFile), { recursive: true })
  writeFileSync(outFile, `${out.join('\n').trimEnd()}\n`, 'utf8')
  console.log(`[bundle-test-structure] wrote ${relative(root, outFile)} (${fileCount} files, ${caseCount} cases)`)
}

main()
