import type { LayerConfigFragment } from '@/types/config'
import type {
  LayerConfigContent,
  LayerConfigContainer,
  LayerConfigNodeContainerRaw,
  LayerConfigNodeContentRaw,
} from '@/types/config-raw'
import {
  mergeNodeContainer,
  mergeNodeContent,
  normalizeNodeContainer,
  normalizeNodeContent,
  stripContainerNode,
  stripContentNode,
} from './node'

/**
 * Peel flat public config into a Canonical fragment.
 * `from` = which side owns top-level fields; then normalize (copy, no mutate).
 */
function toFragment(
  config: LayerConfigContainer | LayerConfigContent,
  from: 'container' | 'content',
): LayerConfigFragment {
  const nested = from === 'container' ? 'content' : 'container'
  const { [nested]: nestedNode, ...primary } = config as Record<string, unknown>

  let containerRaw: LayerConfigNodeContainerRaw | undefined
  let contentRaw: LayerConfigNodeContentRaw | undefined

  if (Object.keys(primary).length > 0) {
    if (from === 'container') {
      containerRaw = primary as LayerConfigNodeContainerRaw
    } else {
      contentRaw = primary as LayerConfigNodeContentRaw
    }
  }
  if (nestedNode) {
    if (nested === 'content') {
      contentRaw = nestedNode as LayerConfigNodeContentRaw
    } else {
      containerRaw = nestedNode as LayerConfigNodeContainerRaw
    }
  }

  const container = normalizeNodeContainer(containerRaw)
  const content = normalizeNodeContent(contentRaw)

  const fragment: LayerConfigFragment = {}
  if (container && Object.keys(container).length > 0) {
    fragment.container = container
  }
  if (content && Object.keys(content).length > 0) {
    fragment.content = content
  }
  return fragment
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
  return fragment
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
