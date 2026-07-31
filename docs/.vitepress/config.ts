import { defineConfig } from 'vitepress'
import { resolve } from 'node:path'

// GitHub Pages 项目站：https://xuyimingwork.github.io/vue-layerx/
// 本地 dev/preview 用 '/'；CI 通过 DOCS_BASE 注入
const base = process.env.DOCS_BASE || '/'
const demosVue3Link = process.env.DOCS_BASE
  ? '/demos/vue3/'
  : 'http://localhost:5173'
const demosVue2Link = process.env.DOCS_BASE
  ? '/demos/vue2/'
  : 'http://localhost:5174'

export default defineConfig({
  title: 'Vue Layerx',
  description: '让弹窗组件通过命令方式调用',
  lang: 'zh-CN',
  base,
  cleanUrls: true,
  // ADR 链到仓库根 DESIGN / TESTING / README，不在 docs 站内
  ignoreDeadLinks: [/DESIGN$/, /TESTING$/, /README$/],
  themeConfig: {
    nav: [
      { text: '指南', link: '/guide/introduction' },
      { text: 'API', link: '/api/' },
      {
        text: 'Demos',
        items: [
          { text: 'Vue 3 + Element Plus', link: demosVue3Link, target: '_blank' },
          { text: 'Vue 2.7 + Element UI', link: demosVue2Link, target: '_blank' },
        ],
      },
      {
        text: 'Playground', link: 'https://element-plus.run/#eyJBcHAudnVlIjoiPHNjcmlwdCBzZXR1cCBsYW5nPVwidHNcIj5cbmltcG9ydCB7IEVsQnV0dG9uIH0gZnJvbSAnZWxlbWVudC1wbHVzJ1xuaW1wb3J0IEhlbGxvV29ybGQgZnJvbSAnLi9IZWxsb1dvcmxkLnZ1ZSdcbmltcG9ydCB7IHVzZURpYWxvZyB9IGZyb20gJy4vZGlhbG9nJ1xuXG5jb25zdCBkaWFsb2cgPSB1c2VEaWFsb2coSGVsbG9Xb3JsZClcbjwvc2NyaXB0PlxuXG48dGVtcGxhdGU+XG4gIDxFbEJ1dHRvbiBAY2xpY2s9XCJkaWFsb2cub3BlbigpXCI+5omT5byA5by556qXPC9FbEJ1dHRvbj5cbjwvdGVtcGxhdGU+XG4iLCJlbGVtZW50LXBsdXMuanMiOiJpbXBvcnQgRWxlbWVudFBsdXMgZnJvbSAnZWxlbWVudC1wbHVzJ1xuaW1wb3J0IHsgZ2V0Q3VycmVudEluc3RhbmNlIH0gZnJvbSAndnVlJ1xuXG5sZXQgaW5zdGFsbGVkID0gZmFsc2VcbmF3YWl0IGxvYWRTdHlsZSgpXG5cbmV4cG9ydCBmdW5jdGlvbiBzZXR1cEVsZW1lbnRQbHVzKCkge1xuICBpZiAoaW5zdGFsbGVkKSByZXR1cm5cbiAgY29uc3QgaW5zdGFuY2UgPSBnZXRDdXJyZW50SW5zdGFuY2UoKVxuICBpbnN0YW5jZS5hcHBDb250ZXh0LmFwcC51c2UoRWxlbWVudFBsdXMpXG4gIGluc3RhbGxlZCA9IHRydWVcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRTdHlsZSgpIHtcbiAgY29uc3Qgc3R5bGVzID0gWydodHRwczovL2Zhc3RseS5qc2RlbGl2ci5uZXQvbnBtL2VsZW1lbnQtcGx1c0BsYXRlc3QvZGlzdC9pbmRleC5jc3MnLCAnaHR0cHM6Ly9mYXN0bHkuanNkZWxpdnIubmV0L25wbS9lbGVtZW50LXBsdXNAbGF0ZXN0L3RoZW1lLWNoYWxrL2RhcmsvY3NzLXZhcnMuY3NzJ10ubWFwKChzdHlsZSkgPT4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGluaycpXG4gICAgICBsaW5rLnJlbCA9ICdzdHlsZXNoZWV0J1xuICAgICAgbGluay5ocmVmID0gc3R5bGVcbiAgICAgIGxpbmsuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIHJlc29sdmUpXG4gICAgICBsaW5rLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgcmVqZWN0KVxuICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmQobGluaylcbiAgICB9KVxuICB9KVxuICByZXR1cm4gUHJvbWlzZS5hbGxTZXR0bGVkKHN0eWxlcylcbn1cbiIsInRzY29uZmlnLmpzb24iOiJ7XG4gIFwiY29tcGlsZXJPcHRpb25zXCI6IHtcbiAgICBcInRhcmdldFwiOiBcIkVTTmV4dFwiLFxuICAgIFwianN4XCI6IFwicHJlc2VydmVcIixcbiAgICBcIm1vZHVsZVwiOiBcIkVTTmV4dFwiLFxuICAgIFwibW9kdWxlUmVzb2x1dGlvblwiOiBcIkJ1bmRsZXJcIixcbiAgICBcInR5cGVzXCI6IFtcImVsZW1lbnQtcGx1cy9nbG9iYWwuZC50c1wiXSxcbiAgICBcImFsbG93SW1wb3J0aW5nVHNFeHRlbnNpb25zXCI6IHRydWUsXG4gICAgXCJhbGxvd0pzXCI6IHRydWUsXG4gICAgXCJjaGVja0pzXCI6IHRydWVcbiAgfSxcbiAgXCJ2dWVDb21waWxlck9wdGlvbnNcIjoge1xuICAgIFwidGFyZ2V0XCI6IDMuM1xuICB9XG59XG4iLCJQbGF5Z3JvdW5kTWFpbi52dWUiOiI8c2NyaXB0IHNldHVwPlxuaW1wb3J0IEFwcCBmcm9tICcuL0FwcC52dWUnXG5pbXBvcnQgeyBzZXR1cEVsZW1lbnRQbHVzIH0gZnJvbSAnLi9lbGVtZW50LXBsdXMuanMnXG5zZXR1cEVsZW1lbnRQbHVzKClcbjwvc2NyaXB0PlxuXG48dGVtcGxhdGU+XG4gIDxBcHAgLz5cbjwvdGVtcGxhdGU+XG4iLCJpbXBvcnQtbWFwLmpzb24iOiJ7XG4gIFwiaW1wb3J0c1wiOiB7XG4gICAgXCJ2dWVcIjogXCJodHRwczovL2Zhc3RseS5qc2RlbGl2ci5uZXQvbnBtL0B2dWUvcnVudGltZS1kb21AbGF0ZXN0L2Rpc3QvcnVudGltZS1kb20uZXNtLWJyb3dzZXIuanNcIixcbiAgICBcIkB2dWUvc2hhcmVkXCI6IFwiaHR0cHM6Ly9mYXN0bHkuanNkZWxpdnIubmV0L25wbS9AdnVlL3NoYXJlZEBsYXRlc3QvZGlzdC9zaGFyZWQuZXNtLWJ1bmRsZXIuanNcIixcbiAgICBcImVsZW1lbnQtcGx1c1wiOiBcImh0dHBzOi8vZmFzdGx5LmpzZGVsaXZyLm5ldC9ucG0vZWxlbWVudC1wbHVzQGxhdGVzdC9kaXN0L2luZGV4LmZ1bGwubWluLm1qc1wiLFxuICAgIFwiZWxlbWVudC1wbHVzL1wiOiBcImh0dHBzOi8vZmFzdGx5LmpzZGVsaXZyLm5ldC9ucG0vZWxlbWVudC1wbHVzQGxhdGVzdC9cIixcbiAgICBcIkBlbGVtZW50LXBsdXMvaWNvbnMtdnVlXCI6IFwiaHR0cHM6Ly9mYXN0bHkuanNkZWxpdnIubmV0L25wbS9AZWxlbWVudC1wbHVzL2ljb25zLXZ1ZUAyL2Rpc3QvaW5kZXgubWluLmpzXCIsXG4gICAgXCJ2dWUtbGF5ZXJ4XCI6IFwiaHR0cHM6Ly9mYXN0bHkuanNkZWxpdnIubmV0L25wbS92dWUtbGF5ZXJ4QGxhdGVzdC9kaXN0L2luZGV4LmpzXCJcbiAgfSxcbiAgXCJzY29wZXNcIjoge31cbn0iLCJIZWxsb1dvcmxkLnZ1ZSI6Ijx0ZW1wbGF0ZT5cbiAg5L2g5aW95LiW55WMXG48L3RlbXBsYXRlPiIsImRpYWxvZy50cyI6ImltcG9ydCB7IGNyZWF0ZUxheWVyIH0gZnJvbSAndnVlLWxheWVyeCdcbmltcG9ydCB7IEVsRGlhbG9nIH0gZnJvbSAnZWxlbWVudC1wbHVzJ1xuXG5leHBvcnQgY29uc3QgdXNlRGlhbG9nID0gY3JlYXRlTGF5ZXIoRWxEaWFsb2csIHsgcHJvcHM6IHsgYXBwZW5kVG9Cb2R5OiB0cnVlIH0gfSkiLCJfbyI6e319'
      }
    ],
    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '简介', link: '/guide/introduction' },
            { text: '快速上手', link: '/guide/quick-start' },
            { text: 'Vue 2.7 兼容', link: '/guide/vue2' },
          ],
        },
        {
          text: '基础',
          items: [
            { text: '创建弹层组合式函数', link: '/guide/create-layer' },
            { text: '打开与关闭', link: '/guide/open-close' },
            { text: '在内容组件里配置弹层', link: '/guide/define-layer' },
            { text: '用事件关闭弹层', link: '/guide/close-on' },
            { text: '向弹层投递插槽', link: '/guide/layer-template' },
          ],
        },
        {
          text: '进阶',
          items: [
            { text: '设计决策', link: '/guide/design' },
            { text: '配置如何合并', link: '/guide/config-merge' },
            { text: '响应式配置', link: '/guide/reactive-config' },
            { text: '等待弹层结果', link: '/guide/confirm' },
            { text: '动态指定内容组件', link: '/guide/dynamic-content' },
            { text: '上下文与生命周期', link: '/guide/context-lifecycle' },
            { text: '实例的更多能力', link: '/guide/instance' },
            { text: '用 adapter 统一改配置', link: '/guide/adapter' },
            { text: '容器与内容未拆分', link: '/guide/no-container' },
            { text: 'SSR 与限制', link: '/guide/ssr' },
          ],
        },
        {
          text: '实践',
          items: [
            { text: '最佳实践', link: '/guide/cookbook/' },
            { text: '综合案例：用户域 CRUD + 审批', link: '/guide/cookbook/form-workflow' },
            { text: '详情里再开同款详情', link: '/guide/cookbook/nested-self' },
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
