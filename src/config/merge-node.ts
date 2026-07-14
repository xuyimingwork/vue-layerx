import {
  isRef,
  type ComponentPublicInstance,
  type Ref,
} from 'vue'
import type {
  LayerConfigNode,
  LayerConfigContainer,
  LayerConfigContent,
  LayerProps,
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

export function mergeContainerNode(
  ...sources: (LayerConfigContainer | undefined)[]
): LayerConfigContainer {
  const result: LayerConfigContainer = mergeNodeConfig(...sources)
  for (const source of sources) {
    if (source?.model !== undefined) result.model = source.model
  }
  return result
}

export function mergeContentNode(
  ...sources: (LayerConfigContent | undefined)[]
): LayerConfigContent {
  const result: LayerConfigContent = mergeNodeConfig(...sources)
  for (const source of sources) {
    if (source?.closeOn !== undefined) result.closeOn = source.closeOn
  }
  return result
}
