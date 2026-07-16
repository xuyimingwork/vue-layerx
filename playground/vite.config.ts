import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 部署在 docs 站点子路径 /playground/；本地 dev 用 '/'
const base = process.env.PLAYGROUND_BASE || '/'

export default defineConfig({
  plugins: [vue()],
  base,
  server: {
    port: 5173,
  },
})
