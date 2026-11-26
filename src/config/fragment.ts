import type {
  LayerAdapter,
  LayerConfigFragment,
  LayerConfigFragmentAdapted,
  LayerConfigNodeContainer,
  LayerConfigNodeContent,
} from '@/types/config'
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

  let container: LayerConfigNodeContainerRaw | undefined
  let content: LayerConfigNodeContentRaw | undefined

  if (Object.keys(primary).length > 0) {
    if (from === 'container') {
      container = primary as LayerConfigNodeContainerRaw
    } else {
      content = primary as LayerConfigNodeContentRaw
    }
  }
  if (nestedNode) {
    if (nested === 'content') {
      content = nestedNode as LayerConfigNodeContentRaw
    } else {
      container = nestedNode as LayerConfigNodeContainerRaw
    }
  }

  return normalizeFragment({ container, content })
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

/**
 * Normalize a fragment's container/content (copy: markRaw + props.ref + closeOn).
 * Input is Raw (or Canonical, which is assignable to Raw); output is Canonical.
 * Use after peel, or when a Canonical-typed fragment may still carry Raw-ish
 * fields (e.g. adapter return value).
 */
export function normalizeFragment(fragment: {
  container?: LayerConfigNodeContainerRaw
  content?: LayerConfigNodeContentRaw
}): LayerConfigFragment {
  const container = normalizeNodeContainer(fragment.container)
  const content = normalizeNodeContent(fragment.content)

  const result: LayerConfigFragment = {}
  if (container && Object.keys(container).length > 0) {
    result.container = container
  }
  if (content && Object.keys(content).length > 0) {
    result.content = content
  }
  return result
}

/** Wrap user adapter so its return value is always Canonical; pass through undefined. */
export function normalizeAdapter(
  adapter: LayerAdapter | undefined,
): LayerAdapter | undefined {
  if (!adapter) return undefined
  return (fragment) => normalizeFragment(adapter(fragment)) as LayerConfigFragmentAdapted
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

/** Shallow copy a node without `props.ref`. Does not mutate input. */
function omitNodeRef<T extends LayerConfigNodeContainer | LayerConfigNodeContent>(
  node: T,
): T {
  if (!node.props || !('ref' in node.props)) return { ...node }
  const { ref: _, ...props } = node.props
  if (Object.keys(props).length === 0) {
    const { props: __, ...rest } = node
    return { ...rest } as T
  }
  return { ...node, props }
}

/**
 * Shallow copy fragment without `props.ref` on either side (clone does not inherit refs).
 * Does not mutate input.
 */
export function omitRefs(fragment: LayerConfigFragment): LayerConfigFragment {
  const result: LayerConfigFragment = {}
  if (fragment.container) result.container = omitNodeRef(fragment.container)
  if (fragment.content) result.content = omitNodeRef(fragment.content)
  return result
}
