import type {
  LayerConfigFragment,
  LayerConfigInstance,
  LayerConfigStatic,
} from '@/types/config'
import { mergeContainerNode, mergeContentNode } from './merge-node-config'

export function createFragment(
  init?: LayerConfigFragment,
): LayerConfigFragment {
  return init ?? {}
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
