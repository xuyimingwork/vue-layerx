import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const pkgRoot = fileURLToPath(new URL('.', import.meta.url))

/** Dist gate: resolve vue-layerx via package exports; pin vue to 2.7. */
export default defineConfig({
  resolve: {
    alias: {
      vue: path.resolve(pkgRoot, 'node_modules/vue/dist/vue.runtime.esm.js'),
    },
    dedupe: ['vue'],
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./setup.ts'],
    include: ['./integration/**/*.test.ts'],
  },
})
