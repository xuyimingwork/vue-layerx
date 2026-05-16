import type { LayerShellOptions } from './types'

export interface ResolvedShellConfig {
  visibleProp: string
  visibleEvent: string
  shellDefaults: LayerShellOptions
}

export function resolveShellConfig(
  shellDefaults: LayerShellOptions = {},
): ResolvedShellConfig {
  const visibleProp = shellDefaults.visibleProp ?? 'modelValue'
  return {
    visibleProp,
    visibleEvent: shellDefaults.visibleEvent ?? `update:${visibleProp}`,
    shellDefaults,
  }
}
