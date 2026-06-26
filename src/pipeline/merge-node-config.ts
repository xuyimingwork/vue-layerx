import type {
  LayerConfigNodeBase,
  LayerConfigNodeContainer,
  LayerConfigNodeContent,
  LayerConfigFragment,
  LayerProps,
} from '@/types/config'

export function mergeProps(...sources: (LayerProps | undefined)[]): LayerProps {
  const result: LayerProps = {}
  for (const source of sources) {
    if (!source) continue
    Object.assign(result, source)
  }
  return result
}

export function mergeNodeConfig(
  ...sources: (LayerConfigNodeBase | undefined)[]
): LayerConfigNodeBase {
  const result: LayerConfigNodeBase = {}
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

export function mergeContainerNode(
  ...sources: (LayerConfigNodeContainer | undefined)[]
): LayerConfigNodeContainer {
  const result: LayerConfigNodeContainer = mergeNodeConfig(...sources)
  for (const source of sources) {
    if (source?.model !== undefined) result.model = source.model
  }
  return result
}

export function mergeContentNode(
  ...sources: (LayerConfigNodeContent | undefined)[]
): LayerConfigNodeContent {
  const result: LayerConfigNodeContent = mergeNodeConfig(...sources)
  for (const source of sources) {
    if (source?.closeOn !== undefined) result.closeOn = source.closeOn
  }
  return result
}

/** Merge fragments; later sources win per side. */
export function mergeFragment(
  ...sources: (LayerConfigFragment | null | undefined)[]
): LayerConfigFragment {
  const container = mergeContainerNode(...sources.map((s) => s?.container))
  const content = mergeContentNode(...sources.map((s) => s?.content))
  const fragment: LayerConfigFragment = {}
  if (Object.keys(container).length > 0) fragment.container = container
  if (Object.keys(content).length > 0) fragment.content = content
  return fragment
}
