import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// 部署在 docs 站点子路径 /demos/vue3/；本地 dev 用 '/'
const base = process.env.DEMOS_BASE || '/'

export default defineConfig({
  plugins: [vue()],
  base,
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
  },
})
