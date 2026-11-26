import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'tsdown'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: false,
  // Keep .js (ESM) + .cjs so existing package.json exports stay valid
  fixedExtension: false,
  alias: {
    '@': path.resolve(__dirname, 'src'),
  },
})
