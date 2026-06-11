import type { LayerProps, LayerShellOptions, VisibleProtocol } from './types'

export interface ResolvedShellConfig {
  visibleProp: string
  visibleEvent: string
  shellDefaults: LayerProps
}

const DEFAULT_VISIBLE: VisibleProtocol = ['modelValue', 'onUpdate:modelValue']

export function resolveShellConfig(
  options: LayerShellOptions = {},
): ResolvedShellConfig {
  const [visibleProp, visibleEvent] = options.visible ?? DEFAULT_VISIBLE
  return {
    visibleProp,
    visibleEvent,
    shellDefaults: options.props ?? {},
  }
}
