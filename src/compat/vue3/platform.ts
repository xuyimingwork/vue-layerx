import type { VNode } from 'vue'

/** Content-root mark for defineLayer (D0.10). Vue 3: Symbol on vnode.props. */
const LAYER_CONTENT = Symbol('vue-layerx:layer-content')

export const DEFAULT_CONTAINER_MODEL = 'modelValue' as const

/** Flat listener prop for container v-model (Vue 3): `onUpdate:${model}`. */
export function toModelUpdateProp(model: string): string {
  return `onUpdate:${model}`
}

/**
 * Vue 3: flat props are already h()-ready (identity).
 * Slots stay as a children object.
 */
export function toPlatformVNodeData(
  flat: Record<string | symbol, unknown>,
): Record<string | symbol, unknown> {
  return flat
}

export function toPlatformSlots(
  slots: Record<string, ((...args: never[]) => VNode | VNode[] | null) | undefined>,
): Record<string, ((...args: never[]) => VNode | VNode[] | null) | undefined> {
  return slots
}

export function markLayerContent(
  props: Record<string | symbol, unknown>,
): Record<string | symbol, unknown> {
  return { ...props, [LAYER_CONTENT]: true }
}

export function isLayerContent(instance: object | null | undefined): boolean {
  if (!instance) return false
  const vnodeProps = (instance as { vnode?: { props?: Record<PropertyKey, unknown> } }).vnode
    ?.props
  return vnodeProps?.[LAYER_CONTENT] === true
}
