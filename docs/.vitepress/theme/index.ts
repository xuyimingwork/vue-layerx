import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import ElementPlus, { ID_INJECTION_KEY } from 'element-plus'
import 'element-plus/dist/index.css'
import DemoBlock from './components/DemoBlock.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.use(ElementPlus)
    app.provide(ID_INJECTION_KEY, {
      prefix: 1024,
      current: 0,
    })
    app.component('DemoBlock', DemoBlock)
  },
} satisfies Theme
