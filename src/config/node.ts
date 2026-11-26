import {
  isRef,
  markRaw,
  type Component,
  type ComponentPublicInstance,
  type Ref,
} from 'vue'
import type {
  LayerConfigNode,
  LayerConfigNodeContainer,
  LayerConfigNodeContent,
  LayerProps,
  LayerRefCallback,
} from '@/types/config'
import type {
  LayerConfigNodeContainerRaw,
  LayerConfigNodeContentRaw,
  LayerConfigNodeRaw,
  LayerPropsRaw,
} from '@/types/config-raw'
import { mergeCloseOn, normalizeCloseOn } from './close-on'
import { warn } from '@/shared/warn'

/** Normalize props.ref to a callback; unsupported values warn and become undefined. */
export function normalizePropRef(value: unknown): LayerRefCallback | undefined {
  if (typeof value === 'function') {
    return value as LayerRefCallback
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

/**
 * Copy Raw node → Canonical: markRaw(component) + normalize props.ref.
 * Does not mutate the input.
 */
export function normalizeNode(
  node?: LayerConfigNodeRaw,
): LayerConfigNode | undefined {
  if (!node) return undefined

  const result: LayerConfigNode = {}

  if (node.component !== undefined) {
    result.component = markRaw(node.component) as Component
  }
  if (node.props !== undefined) {
    result.props = normalizeProps(node.props)
  }
  if (node.slots !== undefined) {
    result.slots = { ...node.slots }
  }

  return result
}

export function normalizeNodeContainer(
  node?: LayerConfigNodeContainerRaw,
): LayerConfigNodeContainer | undefined {
  if (!node) return undefined
  const result: LayerConfigNodeContainer = normalizeNode(node)!
  if (node.model !== undefined) result.model = node.model
  return result
}

export function normalizeNodeContent(
  node?: LayerConfigNodeContentRaw,
): LayerConfigNodeContent | undefined {
  if (!node) return undefined
  const result: LayerConfigNodeContent = normalizeNode(node)!
  if (node.closeOn !== undefined) {
    const closeOn = normalizeCloseOn(node.closeOn)
    if (closeOn !== undefined) result.closeOn = closeOn
  }
  return result
}

function normalizeProps(props: LayerPropsRaw): LayerProps {
  const result: LayerProps = { ...props } as any
  if (props.ref !== undefined) {
    const ref = normalizePropRef(props.ref)
    if (ref !== undefined) result.ref = ref
    else delete result.ref
  }
  return result
}

function composePropRef(prev: unknown, next: unknown): LayerRefCallback | undefined {
  const prevFn = normalizePropRef(prev)
  const nextFn = normalizePropRef(next)
  if (!prevFn) return nextFn
  if (!nextFn) return prevFn
  return (el: ComponentPublicInstance | null) => {
    prevFn(el)
    nextFn(el)
  }
}

export function mergeProps(
  ...sources: (LayerProps | LayerPropsRaw | undefined)[]
): LayerProps {
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

export function mergeNodeContainer(
  ...sources: (LayerConfigNodeContainer | undefined)[]
): LayerConfigNodeContainer {
  const result: LayerConfigNodeContainer = mergeNode(...sources)
  for (const source of sources) {
    if (source?.model !== undefined) result.model = source.model
  }
  return result
}

export function mergeNodeContent(
  ...sources: (LayerConfigNodeContent | undefined)[]
): LayerConfigNodeContent {
  const result: LayerConfigNodeContent = mergeNode(...sources)
  const closeOn = mergeCloseOn(...sources.map((s) => s?.closeOn))
  if (closeOn !== undefined) result.closeOn = closeOn
  return result
}
