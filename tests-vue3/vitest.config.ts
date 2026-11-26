import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    dedupe: ['vue'],
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./setup.ts'],
    include: ['./integration/**/*.test.ts'],
    reporters: ['default', 'junit'],
    outputFile: {
      junit: '../reports/vue3.junit.xml',
    },
    typecheck: {
      enabled: true,
      include: ['./typecheck/**/*.test-d.ts'],
      tsconfig: './tsconfig.json',
    },
  },
})
