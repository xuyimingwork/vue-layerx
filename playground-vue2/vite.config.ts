import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // Pin Vue 2.7 (same as tests-vue2) — avoid root workspace Vue 3.
      vue: fileURLToPath(
        new URL('./node_modules/vue/dist/vue.runtime.esm.js', import.meta.url),
      ),
    },
    dedupe: ['vue'],
  },
  server: {
    port: 5174,
  },
  optimizeDeps: {
    include: ['element-ui'],
  },
})
