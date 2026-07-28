import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const root = fileURLToPath(new URL('.', import.meta.url))

/**
 * Coverage-only: run tests-vue3 cases with vue-layerx → src so hits land on source.
 * Dist/integration gate remains `pnpm test:integration` (tests-vue3/vitest.config.ts).
 */
export default defineConfig({
  resolve: {
    alias: {
      'vue-layerx': path.resolve(root, 'src/index.ts'),
      '@': path.resolve(root, 'src'),
    },
    dedupe: ['vue'],
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests-vue3/setup.ts'],
    include: ['./tests-vue3/integration/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage/integration',
      reporter: ['json', 'json-summary', 'text-summary'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/__test__/**',
        'src/**/types/**',
        'src/**/*.d.ts',
      ],
    },
  },
})
