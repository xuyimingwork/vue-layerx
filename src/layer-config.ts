import type { CreateLayerxOptions, VisibleProtocol } from './types'

export interface ResolvedLayerConfig {
  visibleProp: string
  visibleEvent: string
  factoryOptions: CreateLayerxOptions
}

const DEFAULT_VISIBLE: VisibleProtocol = ['modelValue', 'onUpdate:modelValue']

export function resolveLayerConfig(
  options: CreateLayerxOptions = {},
): ResolvedLayerConfig {
  const [visibleProp, visibleEvent] = options.visible ?? DEFAULT_VISIBLE
  return {
    visibleProp,
    visibleEvent,
    factoryOptions: options,
  }
}
