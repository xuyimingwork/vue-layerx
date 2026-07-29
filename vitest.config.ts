import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const root = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(root, 'src'),
      '@tests': path.resolve(root, 'tests'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['src/**/__test__/**/*.test.ts'],
    // Vue 2.7 LayerApp needs vue@2.7 — covered by vitest.vue2-coverage.config.ts
    exclude: ['src/runtime/__test__/create-layer-app.vue2.test.ts'],
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage/unit',
      reporter: ['json', 'json-summary', 'text-summary'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/__test__/**',
        'tests/**',
        'src/**/types/**',
        'src/compat/types.ts',
        'src/**/*.d.ts',
      ],
    },
  },
})
