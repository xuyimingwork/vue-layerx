import { defineConfig } from 'vitepress'
import { resolve } from 'node:path'

// GitHub Pages 项目站：https://xuyimingwork.github.io/vue-layerx/
// 本地 dev/preview 用 '/'；CI 通过 DOCS_BASE 注入
const base = process.env.DOCS_BASE || '/'
const playgroundLink = process.env.DOCS_BASE
  ? '/playground/'
  : 'http://localhost:5173'

export default defineConfig({
  title: 'Vue Layerx',
  description: '让弹窗组件通过命令方式调用',
  lang: 'zh-CN',
  base,
  cleanUrls: true,
  // ADR 链到仓库根 DESIGN.md，不在 docs 站内
  ignoreDeadLinks: [/DESIGN$/],
  themeConfig: {
    nav: [
      { text: '指南', link: '/guide/introduction' },
      { text: 'API', link: '/api/' },
      { text: 'Playground', link: playgroundLink, target: '_blank' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '简介', link: '/guide/introduction' },
            { text: '快速上手', link: '/guide/quick-start' },
          ],
        },
        {
          text: '基础',
          items: [
            { text: '创建弹层工厂', link: '/guide/create-layer' },
            { text: '打开与关闭', link: '/guide/open-close' },
            { text: 'defineLayer', link: '/guide/define-layer' },
            { text: '事件关层 closeOn', link: '/guide/close-on' },
            { text: 'LayerTemplate', link: '/guide/layer-template' },
          ],
        },
        {
          text: '进阶',
          items: [
            { text: '配置合并', link: '/guide/config-merge' },
            { text: '响应式配置', link: '/guide/reactive-config' },
            { text: 'adapter', link: '/guide/adapter' },
            { text: '实例进阶', link: '/guide/instance' },
            { text: 'SSR 与限制', link: '/guide/ssr' },
            { text: 'LayerNoContainer', link: '/guide/no-container' },
          ],
        },
        {
          text: '实践教程',
          collapsed: true,
          items: [
            { text: '概览', link: '/guide/cookbook/' },
            { text: '§1 列表详情弹层', link: '/guide/cookbook/detail' },
            { text: '§2 OrderDetail 组合', link: '/guide/cookbook/compose' },
            { text: '§3 编辑表单', link: '/guide/cookbook/edit' },
            { text: '§4 visible-outside', link: '/guide/cookbook/visible-outside' },
            { text: '§5 adapt', link: '/guide/cookbook/adapt' },
            { text: '§6 未保存拦截', link: '/guide/cookbook/before-close' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API',
          items: [
            { text: '概览', link: '/api/' },
            { text: 'createLayer', link: '/api/create-layer' },
            { text: 'defineLayer', link: '/api/define-layer' },
            { text: 'useLayer', link: '/api/use-layer' },
            { text: 'LayerInstance', link: '/api/layer-instance' },
            { text: 'LayerTemplate', link: '/api/layer-template' },
            { text: 'LayerNoContainer', link: '/api/layer-no-container' },
            { text: '配置', link: '/api/config' },
            { text: '类型', link: '/api/types' },
            { text: '配置域命名', link: '/config-naming' },
          ],
        },
      ],
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/xuyimingwork/vue-layerx' },
    ],
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
