import { defineConfig } from 'vitepress'
import { resolve } from 'node:path'

// GitHub Pages 项目站：https://xuyimingwork.github.io/vue-layerx/
// 本地 dev/preview 用 '/'；CI 通过 DOCS_BASE 注入
const base = process.env.DOCS_BASE || '/'
const playgroundLink = process.env.DOCS_BASE
  ? '/playground/'
  : 'http://localhost:5173'

export default defineConfig({
  title: 'vue-layerx',
  description: 'UserDetail 随处组合 · useDetailLayer 响应式换壳',
  lang: 'zh-CN',
  base,
  cleanUrls: true,
  // ADR 链到仓库根 DESIGN.md，不在 docs 站内
  ignoreDeadLinks: [/DESIGN$/],
  themeConfig: {
    nav: [
      { text: '教程', link: '/guide/introduction' },
      { text: 'API', link: '/api/' },
      { text: 'Playground', link: playgroundLink, target: '_blank' },
    ],
    sidebar: [
      {
        text: '开始',
        items: [
          { text: '为什么需要它', link: '/guide/introduction' },
          { text: '搭建 BaseDialog', link: '/guide/getting-started' },
        ],
      },
      {
        text: '教程',
        items: [
          { text: '§1 列表详情弹层', link: '/guide/detail' },
          { text: '§2 OrderDetail 组合', link: '/guide/compose' },
          { text: '§3 编辑表单', link: '/guide/edit' },
          { text: '§4 visible-outside', link: '/guide/visible-outside' },
          { text: '§5 useDetailLayer + adapt', link: '/guide/adapt' },
          { text: '§6 未保存拦截', link: '/guide/before-close' },
        ],
      },
      {
        text: '参考',
        items: [{ text: 'API', link: '/api/' }],
      },
    ],
    socialLinks: [],
    footer: {
      message: 'MIT Licensed',
      copyright: 'Copyright © 2026 vue-layerx',
    },
    search: { provider: 'local' },
  },
  vite: {
    resolve: {
      alias: {
        'vue-layerx': resolve(__dirname, '../../src/index.ts'),
        '@': resolve(__dirname, '../../src'),
        '@docs': resolve(__dirname, '..'),
      },
    },
  },
})
