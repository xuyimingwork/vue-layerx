import type {
  LayerConfigFragment,
  LayerConfigInstance,
  LayerConfigStatic,
} from '@/types/config'
import {
  mergeContainerNode,
  mergeContentNode,
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

export function toFragmentFromStatic(config: LayerConfigStatic = {}): LayerConfigFragment {
  const { content, ...container } = config
  return mergeFragment(
    Object.keys(container).length > 0 ? { container } : undefined,
    content ? { content } : undefined,
  )
}

export function toFragmentFromInstance(config: LayerConfigInstance = {}): LayerConfigFragment {
  const { container, ...content } = config
  return mergeFragment(
    Object.keys(content).length > 0 ? { content } : undefined,
    container ? { container } : undefined,
  )
}

/** Merge fragments; later sources win per side. Only content/container participate. */
export function mergeFragment(
  ...sources: (LayerConfigFragment | null | undefined)[]
): LayerConfigFragment {
  const container = mergeContainerNode(...sources.map((s) => s?.container))
  const content = mergeContentNode(...sources.map((s) => s?.content))
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
