import type {
  LayerConfigFragment,
  LayerConfigInstance,
  LayerConfigStatic,
  LayerConfigNode,
  LayerConfigContainer,
  LayerConfigContent,
  LayerProps,
  SlotRenderFn,
} from '@/types/config'
import { mergeContainerNode, mergeContentNode } from './merge-node-config'
import { normalizeFragmentComponent } from './normalize-component'

export function createFragment(
  init?: LayerConfigFragment,
): LayerConfigFragment {
  return normalizeFragmentComponent(init ?? {})
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

function stripNodeProps(
  props: LayerProps | undefined,
  prefix: string,
  shouldStrip: (path: string) => boolean,
): LayerProps | undefined {
  if (!props) return undefined
  const result: LayerProps = {}
  for (const [key, value] of Object.entries(props)) {
    const path = `${prefix}.props.${key}`
    if (!shouldStrip(path)) result[key] = value
  }
  return Object.keys(result).length > 0 ? result : undefined
}

function stripNodeConfig(
  node: LayerConfigNode,
  prefix: string,
  shouldStrip: (path: string) => boolean,
): LayerConfigNode {
  const result: LayerConfigNode = {}

  if (node.component !== undefined) {
    const path = `${prefix}.component`
    if (!shouldStrip(path)) result.component = normalizeComponent(node.component)
  }

  const props = stripNodeProps(node.props, prefix, shouldStrip)
  if (props) result.props = props

  if (node.slots) {
    const slots: Record<string, SlotRenderFn> = {}
    for (const [name, fn] of Object.entries(node.slots)) {
      const path = `${prefix}.slots.${name}`
      if (!shouldStrip(path)) slots[name] = fn
    }
    if (Object.keys(slots).length > 0) result.slots = slots
  }

  return result
}

function stripContainerNode(
  node: LayerConfigContainer,
  shouldStrip: (path: string) => boolean,
  prefix = 'container',
): LayerConfigContainer {
  const result = stripNodeConfig(node, prefix, shouldStrip) as LayerConfigContainer
  if (node.model !== undefined) {
    const path = `${prefix}.model`
    if (!shouldStrip(path)) result.model = node.model
  }
  return result
}

function stripContentNode(
  node: LayerConfigContent,
  shouldStrip: (path: string) => boolean,
  prefix = 'content',
): LayerConfigContent {
  const result = stripNodeConfig(node, prefix, shouldStrip) as LayerConfigContent
  if (node.closeOn !== undefined) {
    const path = `${prefix}.closeOn`
    if (!shouldStrip(path)) result.closeOn = node.closeOn
  }
  return result
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
