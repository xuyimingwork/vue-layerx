import type { DemoFile } from './types'

const rawModules = import.meta.glob('./*/**/*.{vue,ts}', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

/** Collect `?raw` sources under `./{dir}/` (excludes catalog/types). */
export function filesFor(dir: string): DemoFile[] {
  const prefix = `./${dir}/`
  return Object.entries(rawModules)
    .filter(([path]) => path.startsWith(prefix))
    .map(([path, code]) => ({
      name: path.slice(path.lastIndexOf('/') + 1),
      code,
    }))
    .sort((a, b) => {
      if (a.name === 'index.vue') return -1
      if (b.name === 'index.vue') return 1
      return a.name.localeCompare(b.name)
    })
}
