import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const root = fileURLToPath(new URL('.', import.meta.url))
const vue2 = path.resolve(root, 'tests-vue2/node_modules/vue/dist/vue.runtime.esm.js')

/**
 * Coverage-only: tests-vue2 cases with vue-layerx → src and vue → 2.7.
 * Dist gate remains `pnpm test:integration:vue2`.
 */
export default defineConfig({
  resolve: {
    alias: {
      'vue-layerx': path.resolve(root, 'src/index.ts'),
      '@': path.resolve(root, 'src'),
      vue: vue2,
    },
    dedupe: ['vue'],
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests-vue2/setup.ts'],
    include: [
      './tests-vue2/integration/**/*.test.ts',
      // Vue 2.7-only internals (excluded from main unit vitest)
      './src/compat/vue2/__test__/create-layer-app.test.ts',
    ],
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage/integration-vue2',
      reporter: ['json', 'json-summary', 'text-summary'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/__test__/**',
        'src/**/types/**',
        'src/compat/types.ts',
        'src/**/*.d.ts',
      ],
    },
  },
})
