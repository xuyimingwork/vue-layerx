import type { LayerNodeConfig, LayerProps } from '@/core/types/config'

export function mergeProps(...sources: (LayerProps | undefined)[]): LayerProps {
  const result: LayerProps = {}
  for (const source of sources) {
    if (!source) continue
    Object.assign(result, source)
  }
  return result
}

export function mergeNodeConfig(
  ...sources: (LayerNodeConfig | undefined)[]
): LayerNodeConfig {
  const result: LayerNodeConfig = {}
  for (const source of sources) {
    if (!source) continue
    if (source.component !== undefined) result.component = source.component
    result.props = mergeProps(result.props, source.props)
    if (source.slots) {
      result.slots = { ...result.slots, ...source.slots }
    }
  }
  return result
}
