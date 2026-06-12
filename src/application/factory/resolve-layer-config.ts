import { DEFAULT_VISIBLE } from '../../domain/constants/visible'
import type { CreateLayerxOptions } from '../../domain/types'

export interface ResolvedLayerConfig {
  visibleProp: string
  visibleEvent: string
  factoryOptions: CreateLayerxOptions
}

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
