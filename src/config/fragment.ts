import type {
  LayerConfigFragment,
  LayerConfigContent,
  LayerConfigContainer,
} from '@/types/config'
import {
  mergeNodeContainer,
  mergeNodeContent,
  normalizeNode,
  stripContainerNode,
  stripContentNode,
} from './node'

function normalizeFragment(
  fragment: LayerConfigFragment,
): LayerConfigFragment {
  normalizeNode(fragment.container)
  normalizeNode(fragment.content)
  return fragment
}

export function createFragment(
  init?: LayerConfigFragment,
): LayerConfigFragment {
  return normalizeFragment(init ?? {})
}

/** Peel flat public config into a fragment; `from` = which side owns top-level fields. */
function toFragment(
  config: LayerConfigContainer | LayerConfigContent,
  from: 'container' | 'content',
): LayerConfigFragment {
  const nested = from === 'container' ? 'content' : 'container'
  const { [nested]: node, ...primary } = config as Record<string, unknown>
  return mergeFragment(
    Object.keys(primary).length > 0 ? { [from]: primary } : undefined,
    node ? { [nested]: node } : undefined,
  )
}

export function toFragmentFromContainer(
  config: LayerConfigContainer = {},
): LayerConfigFragment {
  return toFragment(config, 'container')
}

export function toFragmentFromContent(
  config: LayerConfigContent = {},
): LayerConfigFragment {
  return toFragment(config, 'content')
}

/** Merge fragments; later sources win per side. Only content/container participate. */
export function mergeFragment(
  ...sources: (LayerConfigFragment | null | undefined)[]
): LayerConfigFragment {
  const container = mergeNodeContainer(...sources.map((s) => s?.container))
  const content = mergeNodeContent(...sources.map((s) => s?.content))
  const fragment: LayerConfigFragment = {}
  if (Object.keys(container).length > 0) fragment.container = container
  if (Object.keys(content).length > 0) fragment.content = content
  return createFragment(fragment)
}

/**
 * Shallow copy fragment; remove fields where shouldStrip(path) is true.
 * Does not mutate input.
 */
export function stripFragment(
  fragment: LayerConfigFragment,
  shouldStrip: (path: string) => boolean,
): LayerConfigFragment {
  const result: LayerConfigFragment = {}

  if (fragment.container) {
    const container = stripContainerNode(fragment.container, shouldStrip)
    if (Object.keys(container).length > 0) result.container = container
  }

  if (fragment.content) {
    const content = stripContentNode(fragment.content, shouldStrip)
    if (Object.keys(content).length > 0) result.content = content
  }

  return result
}
