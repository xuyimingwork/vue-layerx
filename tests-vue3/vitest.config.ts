import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    dedupe: ['vue'],
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./setup.ts'],
    include: ['./integration/**/*.test.ts'],
  },
})
