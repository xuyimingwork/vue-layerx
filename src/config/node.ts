import {
  isRef,
  markRaw,
  type Component,
  type ComponentPublicInstance,
  type Ref,
} from 'vue'
import type {
  LayerConfigNode,
  LayerConfigContainer,
  LayerConfigContent,
  LayerProps,
  SlotRenderFn,
} from '@/types/config'
import { warn } from '@/shared/warn'

type RefCallback = (el: ComponentPublicInstance | null) => void

/** Normalize props.ref to a callback; unsupported values warn and become undefined. */
export function normalizePropRef(value: unknown): RefCallback | undefined {
  if (typeof value === 'function') {
    return value as RefCallback
  }
  if (isRef(value)) {
    const ref = value as Ref<ComponentPublicInstance | null>
    return (el) => {
      ref.value = el
    }
  }
  if (typeof value === 'string') {
    warn('string ref on layer props is not supported; ignored')
    return undefined
  }
  if (value != null) {
    warn('invalid props.ref value; ignored')
    return undefined
  }
  return undefined
}

/** markRaw(component) + normalize props.ref in place. */
export function normalizeNode(
  node?: LayerConfigContainer | LayerConfigContent,
): void {
  if (node?.component !== undefined) {
    node.component = markRaw(node.component) as Component
  }
  if (node?.props?.ref !== undefined) {
    node.props.ref = normalizePropRef(node.props.ref)
  }
}

function composePropRef(prev: unknown, next: unknown): unknown {
  const prevFn = normalizePropRef(prev)
  const nextFn = normalizePropRef(next)
  if (!prevFn) return nextFn ?? next
  if (!nextFn) return prevFn
  return (el: ComponentPublicInstance | null) => {
    prevFn(el)
    nextFn(el)
  }
}

export function mergeProps(...sources: (LayerProps | undefined)[]): LayerProps {
  const result: LayerProps = {}
  for (const source of sources) {
    if (!source) continue
    for (const [key, value] of Object.entries(source)) {
      if (key === 'ref') {
        result.ref = composePropRef(result.ref, value)
      } else {
        result[key] = value
      }
    }
  }
  return result
}

export function mergeNode(
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

export function mergeContainerNode(
  ...sources: (LayerConfigContainer | undefined)[]
): LayerConfigContainer {
  const result: LayerConfigContainer = mergeNode(...sources)
  for (const source of sources) {
    if (source?.model !== undefined) result.model = source.model
  }
  return result
}

export function mergeContentNode(
  ...sources: (LayerConfigContent | undefined)[]
): LayerConfigContent {
  const result: LayerConfigContent = mergeNode(...sources)
  for (const source of sources) {
    if (source?.closeOn !== undefined) result.closeOn = source.closeOn
  }
  return result
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

function stripNode(
  node: LayerConfigNode,
  prefix: string,
  shouldStrip: (path: string) => boolean,
): LayerConfigNode {
  const result: LayerConfigNode = {}

  if (node.component !== undefined) {
    const path = `${prefix}.component`
    if (!shouldStrip(path)) result.component = node.component
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

export function stripContainerNode(
  node: LayerConfigContainer,
  shouldStrip: (path: string) => boolean,
  prefix = 'container',
): LayerConfigContainer {
  const result = stripNode(node, prefix, shouldStrip) as LayerConfigContainer
  if (node.model !== undefined) {
    const path = `${prefix}.model`
    if (!shouldStrip(path)) result.model = node.model
  }
  return result
}

export function stripContentNode(
  node: LayerConfigContent,
  shouldStrip: (path: string) => boolean,
  prefix = 'content',
): LayerConfigContent {
  const result = stripNode(node, prefix, shouldStrip) as LayerConfigContent
  if (node.closeOn !== undefined) {
    const path = `${prefix}.closeOn`
    if (!shouldStrip(path)) result.closeOn = node.closeOn
  }
  return result
}
