import type { LayerConfigNode, LayerProps } from '@/types/config'

export function mergeProps(...sources: (LayerProps | undefined)[]): LayerProps {
  const result: LayerProps = {}
  for (const source of sources) {
    if (!source) continue
    Object.assign(result, source)
  }
  return result
}

export function mergeNodeConfig(
  ...sources: (LayerConfigNode | undefined)[]
): LayerConfigNode {
  const result: LayerConfigNode = {}
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
