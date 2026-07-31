/**
 * Bundle guide sidebar markdown (开始 / 基础 / 进阶 / 实践) into one file,
 * including example sources referenced by each page (and their local imports).
 *
 * Usage: node scripts/bundle-guide-md.mjs
 * Output: docs/guide/_bundle.md (gitignored)
 *
 * Keep SECTIONS in sync with docs/.vitepress/config.ts → sidebar['/guide/'].
 */
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, extname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const docsDir = join(root, 'docs')
const docsGuide = join(docsDir, 'guide')
const docsExamples = join(docsDir, 'examples')
const outFile = join(docsGuide, '_bundle.md')

/** @type {{ title: string, pages: { title: string, link: string }[] }[]} */
const SECTIONS = [
  {
    title: '开始',
    pages: [
      { title: '简介', link: '/guide/introduction' },
      { title: '快速上手', link: '/guide/quick-start' },
      { title: 'Vue 2.7 兼容', link: '/guide/vue2' },
    ],
  },
  {
    title: '基础',
    pages: [
      { title: '创建弹层组合式函数', link: '/guide/create-layer' },
      { title: '打开与关闭', link: '/guide/open-close' },
      { title: '在内容组件里配置弹层', link: '/guide/define-layer' },
      { title: '用事件关闭弹层', link: '/guide/close-on' },
      { title: '向弹层投递插槽', link: '/guide/layer-template' },
    ],
  },
  {
    title: '进阶',
    pages: [
      { title: '设计决策', link: '/guide/design' },
      { title: '配置如何合并', link: '/guide/config-merge' },
      { title: '响应式配置', link: '/guide/reactive-config' },
      { title: '等待弹层结果', link: '/guide/confirm' },
      { title: '动态指定内容组件', link: '/guide/dynamic-content' },
      { title: '上下文与生命周期', link: '/guide/context-lifecycle' },
      { title: '实例的更多能力', link: '/guide/instance' },
      { title: '用 adapter 统一改配置', link: '/guide/adapter' },
      { title: '容器与内容未拆分', link: '/guide/no-container' },
      { title: 'SSR 与限制', link: '/guide/ssr' },
    ],
  },
  {
    title: '实践',
    pages: [
      { title: '最佳实践', link: '/guide/cookbook/' },
      { title: '综合案例：用户域 CRUD + 审批', link: '/guide/cookbook/form-workflow' },
      { title: '详情里再开同款详情', link: '/guide/cookbook/nested-self' },
    ],
  },
]

const FENCE_LANG = {
  '.vue': 'vue',
  '.ts': 'ts',
  '.tsx': 'tsx',
  '.js': 'js',
  '.jsx': 'jsx',
  '.mjs': 'js',
  '.cjs': 'js',
  '.css': 'css',
  '.scss': 'scss',
  '.html': 'html',
  '.json': 'json',
  '.md': 'md',
}

function linkToPath(link) {
  let rel = link.replace(/^\/guide\/?/, '')
  if (!rel || rel === 'cookbook' || rel === 'cookbook/') {
    return join(docsGuide, 'cookbook/index.md')
  }
  rel = rel.replace(/\/$/, '')
  return join(docsGuide, rel.endsWith('.md') ? rel : `${rel}.md`)
}

function toPosix(p) {
  return p.replace(/\\/g, '/')
}

function stripQuery(spec) {
  return spec.replace(/[?#].*$/, '')
}

function extractScriptBlock(md) {
  const m = md.match(/^<script\b[^>]*>([\s\S]*?)<\/script>/i)
  return m ? m[1] : ''
}

function stripVitePressChrome(md) {
  let s = md.replace(/^\uFEFF/, '')
  s = s.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n*/, '')
  s = s.replace(/^<script\b[^>]*>[\s\S]*?<\/script>\r?\n*/i, '')
  return s.trim() + '\n'
}

function demoteHeadings(md) {
  return md.replace(/^(#{1,5})(\s)/gm, (_, hashes, space) => `#${hashes}${space}`)
}

/** Specifiers from import/export ... from '...' and side-effect import '...' */
function parseImportSpecs(code) {
  const specs = []
  const fromRe = /\b(?:import|export)\s+[\s\S]*?\bfrom\s+['"]([^'"]+)['"]/g
  const sideRe = /\bimport\s+['"]([^'"]+)['"]/g
  let m
  while ((m = fromRe.exec(code))) specs.push(m[1])
  while ((m = sideRe.exec(code))) specs.push(m[1])
  return specs
}

function tryResolveFile(baseDir, spec) {
  const clean = stripQuery(spec)
  const candidates = [resolve(baseDir, clean)]
  if (!extname(clean)) {
    for (const ext of ['.vue', '.ts', '.tsx', '.js', '.mjs', '.json', '.css']) {
      candidates.push(resolve(baseDir, clean + ext))
    }
    candidates.push(resolve(baseDir, clean, 'index.ts'), resolve(baseDir, clean, 'index.js'))
  }
  for (const c of candidates) {
    if (existsSync(c) && statSync(c).isFile()) return c
  }
  return null
}

function isUnderExamples(abs) {
  const rel = relative(docsExamples, abs)
  return rel && !rel.startsWith('..') && !rel.startsWith('/')
}

/** Seeds: example files imported from a guide page script */
function seedsFromGuideMd(mdPath, rawMd) {
  const script = extractScriptBlock(rawMd)
  const seeds = []
  const base = dirname(mdPath)
  for (const spec of parseImportSpecs(script)) {
    const clean = stripQuery(spec)
    if (!clean.includes('examples/')) continue
    const abs = tryResolveFile(base, clean)
    if (abs && isUnderExamples(abs)) seeds.push(abs)
  }
  return seeds
}

/** Walk local relative imports within docs/examples */
function collectExampleClosure(seeds) {
  const ordered = []
  const seen = new Set()
  const queue = [...seeds]

  while (queue.length) {
    const abs = queue.shift()
    const key = toPosix(abs)
    if (seen.has(key)) continue
    if (!isUnderExamples(abs)) continue
    seen.add(key)
    ordered.push(abs)

    let code
    try {
      code = readFileSync(abs, 'utf8')
    } catch {
      continue
    }
    for (const spec of parseImportSpecs(code)) {
      const clean = stripQuery(spec)
      if (!clean.startsWith('.')) continue
      const dep = tryResolveFile(dirname(abs), clean)
      if (dep && isUnderExamples(dep) && !seen.has(toPosix(dep))) {
        queue.push(dep)
      }
    }
  }
  return ordered
}

function fenceFor(abs, code) {
  const lang = FENCE_LANG[extname(abs).toLowerCase()] || ''
  const rel = toPosix(relative(root, abs))
  return [`#### \`${rel}\``, '', `\`\`\`${lang}`, code.replace(/\n$/, ''), '```', '']
}

const emittedSources = new Set()

function appendSources(parts, files) {
  if (!files.length) return
  parts.push('### 示例源码', '')
  for (const abs of files) {
    const rel = toPosix(relative(root, abs))
    if (emittedSources.has(rel)) {
      parts.push(`> 已收录：\`${rel}\``, '')
      continue
    }
    emittedSources.add(rel)
    const code = readFileSync(abs, 'utf8')
    parts.push(...fenceFor(abs, code))
  }
}

function loadPage(page) {
  const file = linkToPath(page.link)
  let raw
  try {
    raw = readFileSync(file, 'utf8')
  } catch (e) {
    throw new Error(`Missing ${file} (from ${page.link}): ${e.message}`)
  }
  const seeds = seedsFromGuideMd(file, raw)
  const sources = collectExampleClosure(seeds)
  let body = stripVitePressChrome(raw)
  body = demoteHeadings(body)
  return { file, body, sources }
}

const parts = [
  '# Vue Layerx 指南合集',
  '',
  '> 由 `pnpm docs:bundle`（`scripts/bundle-guide-md.mjs`）根据侧栏「开始 / 基础 / 进阶 / 实践」生成。',
  '> 含各篇引用的 `docs/examples/**` 源码（及示例内相对引用）；同一文件只全文收录一次。',
  '> 勿手改；已 gitignore。站内链接仍指向原路径，合集内不一定可点。',
  '',
]

let pageCount = 0
let sourceFileCount = 0

for (const section of SECTIONS) {
  parts.push(`# ${section.title}`, '')
  for (const page of section.pages) {
    const { file, body, sources } = loadPage(page)
    pageCount++
    sourceFileCount += sources.length
    const rel = toPosix(relative(root, file))
    parts.push(`<!-- source: ${rel} | ${page.title} -->`, '')
    parts.push(body.trimEnd(), '')
    appendSources(parts, sources)
    parts.push('---', '')
  }
}

mkdirSync(dirname(outFile), { recursive: true })
writeFileSync(outFile, parts.join('\n').replace(/\n{3,}/g, '\n\n'), 'utf8')
console.log(
  `Wrote ${toPosix(relative(root, outFile))} (${pageCount} pages, ${emittedSources.size} unique example files, ${sourceFileCount} refs)`,
)
